"use strict";

const util = require("../index");

describe("JSONAPI helper tool", function() {
  it("parses relationship data", function() {
    const actual = {
      data: [
        {
          type: "posts",
          id: "1",
          attributes: {
            title: "Rails is Omakase"
          },
          relationships: {
            author: {
              data: { type: "people", id: "9" }
            },
            comments: {
              data: [
                { type: "comments", id: "0" },
                { type: "comments", id: "1" }
              ]
            }
          }
        },
        {
          type: "posts",
          id: "2",
          attributes: {
            title: "The Parley Letter"
          },
          relationships: {
            author: {
              data: { type: "people", id: "9" }
            },
            comments: {
              data: [{ type: "comments", id: "2" }]
            }
          }
        }
      ],
      included: [
        {
          type: "people",
          id: "9",
          attributes: {
            name: "@d2h"
          }
        },
        {
          type: "comments",
          id: "0",
          attributes: {
            body: "Mmmmmakase"
          }
        },
        {
          type: "comments",
          id: "1",
          attributes: {
            body: "I prefer unagi"
          }
        },
        {
          type: "comments",
          id: "2",
          attributes: {
            body: "What's Omakase?"
          }
        }
      ]
    };

    const expected = {
      data: [
        {
          type: "posts",
          id: "1",
          title: "Rails is Omakase",
          author: {
            type: "people",
            id: "9",
            name: "@d2h"
          },
          comments: [
            {
              type: "comments",
              id: "0",
              body: "Mmmmmakase"
            },
            {
              type: "comments",
              id: "1",
              body: "I prefer unagi"
            }
          ]
        },
        {
          type: "posts",
          id: "2",
          title: "The Parley Letter",
          author: {
            type: "people",
            id: "9",
            name: "@d2h"
          },
          comments: [
            {
              type: "comments",
              id: "2",
              body: "What's Omakase?"
            }
          ]
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });

  it("should parse related resources with deep structure", function() {
    const actual = {
      data: [
        {
          type: "foo",
          id: "foo-id",
          relationships: {
            list: {
              data: { type: "bar", id: "bar-id" }
            }
          }
        }
      ],
      included: [
        {
          type: "bar",
          id: "bar-id",
          attributes: {
            deep: [{ "1": "a" }, { "2": "b" }, { "3": "c" }]
          }
        }
      ]
    };

    const expected = {
      data: [
        {
          type: "foo",
          id: "foo-id",
          list: {
            type: "bar",
            id: "bar-id",
            deep: [
              {
                "1": "a"
              },
              {
                "2": "b"
              },
              {
                "3": "c"
              }
            ]
          }
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });
  it("should return an error object when passed a empty response", function() {
    const actual = undefined;
    const expected = {
      errors: [
        {
          status: "400",
          title: "parse error",
          detail: "supplied object was undefined"
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });

  it("should return an error object when containing invalid top level members", function() {
    const actual = {
      foo: true,
      bar: true
    };
    const expected = {
      errors: [
        {
          status: "400",
          title: "parse error",
          detail:
            "supplied object contains the following invalid key's foo, bar"
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });

  it("should return an error object when missing must top-level members", function() {
    const actual = {};
    const expected = {
      errors: [
        {
          status: "400",
          title: "parse error",
          detail:
            "supplied object MUST contain at least one of the following top-level members: data, errors, meta"
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });

  it("should return an error object if data and errors are definen in the same object", function() {
    const actual = {
      errors: {},
      data: []
    };

    const expected = {
      errors: [
        {
          status: "400",
          title: "parse error",
          detail:
            "top-level members data and errors MUST NOT coexist in the same object"
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });

  it("returns null for missing relationships", function() {
    const actual = {
      data: [
        {
          id: "1",
          type: "posts",
          title: "Rails is Omakase",
          relationships: {
            author: {
              data: { type: "people", id: "9" }
            },
            comments: {
              data: [
                { type: "comments", id: "0" },
                { type: "comments", id: "1" }
              ]
            },
            image: {
              data: null,
            }
          }
        }
      ]
    };

    const expected = {
      data: [
        {
          id: "1",
          type: "posts",
          title: "Rails is Omakase",
          author: null,
          image: null,
          comments: []
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });

  it("returns null for missing relationships", function() {
    const actual = {
      data: [
        {
          id: "1",
          type: "posts",
          title: "Rails is Omakase",
          relationships: {
            author: { data: { type: 'missing', 'id': '2' } }
          }
        }
      ]
    };

    const expected = {
      data: [
        {
          id: "1",
          type: "posts",
          title: "Rails is Omakase",
          author: null
        }
      ]
    };

    expect(util.parse(actual)).toEqual(expected);
  });
  it("merges a compound resource", function() {
    const actual = {
      data: [
        {
          id: "1",
          type: "posts",
          title: "Rails is Omakase",
          relationships: {
            comments: {
              data: [
                { type: "comments", id: "1" },
                { type: "comments", id: "2" }
              ]
            }
          }
        }
      ],
      included: [
        {
          type: "images",
          id: "1",
          attributes: {
            src: "http://example.com/static/picture_1.jpg"
          }
        },
        {
          type: "images",
          id: "2",
          attributes: {
            src: "http://example.com/static/picture_2.jpg"
          }
        },
        {
          type: "images",
          id: "3",
          attributes: {
            src: "http://example.com/static/picture_3.jpg"
          }
        },
        {
          type: "comments",
          id: "1",
          attributes: {
            body: "Mmmmmakase"
          },
          relationships: {
            picture: {
              data: [{ type: "images", id: "1" }]
            }
          }
        },
        {
          type: "comments",
          id: "2",
          attributes: {
            body: "I prefer unagi"
          },
          relationships: {
            picture: {
              data: [{ type: "images", id: "2" }, { type: "images", id: "3" }]
            }
          }
        }
      ]
    };

    const expected = {
      data: [
        {
          type: "posts",
          id: "1",
          title: "Rails is Omakase",
          comments: [
            {
              type: "comments",
              id: "1",
              body: "Mmmmmakase",
              picture: [
                {
                  type: "images",
                  id: "1",
                  src: "http://example.com/static/picture_1.jpg"
                }
              ]
            },
            {
              type: "comments",
              id: "2",
              body: "I prefer unagi",
              picture: [
                {
                  type: "images",
                  id: "2",
                  src: "http://example.com/static/picture_2.jpg"
                },
                {
                  type: "images",
                  id: "3",
                  src: "http://example.com/static/picture_3.jpg"
                }
              ]
            }
          ]
        }
      ]
    };
    expect(util.parse(actual)).toEqual(expected);
  });

  it("will not mutate the source object", function() {
    const actual = {
      data: [
        {
          type: "foo",
          id: "foo-id",
          relationships: {
            list: {
              data: { type: "bar", id: "bar-id" }
            }
          }
        }
      ],
      included: [
        {
          type: "bar",
          id: "bar-id",
          attributes: {
            deep: [{ "1": "a" }, { "2": "b" }, { "3": "c" }]
          }
        }
      ]
    };

    const expected = {
      data: [
        {
          type: "foo",
          id: "foo-id",
          relationships: {
            list: {
              data: { type: "bar", id: "bar-id" }
            }
          }
        }
      ],
      included: [
        {
          type: "bar",
          id: "bar-id",
          attributes: {
            deep: [{ "1": "a" }, { "2": "b" }, { "3": "c" }]
          }
        }
      ]
    };

    util.parse(actual);

    expect(actual).toEqual(expected);
  });

  it("parses a single resource", function() {
    const actual = {
      data: {
        type: "foo",
        id: "foo-id",
        relationships: {
          list: {
            data: { type: "bar", id: "bar-id" }
          }
        }
      },
      included: [
        {
          type: "bar",
          id: "bar-id",
          attributes: {
            deep: [{ "1": "a" }, { "2": "b" }, { "3": "c" }]
          }
        }
      ]
    };

    const expected = {
      data: {
        type: "foo",
        id: "foo-id",
        list: {
          type: "bar",
          id: "bar-id",
          deep: [
            {
              "1": "a"
            },
            {
              "2": "b"
            },
            {
              "3": "c"
            }
          ]
        }
      }
    };

    expect(util.parse(actual)).toEqual(expected);
  });
});
