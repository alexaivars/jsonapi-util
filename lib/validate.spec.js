"use strict";

const { isDocument, isResource } = require("../index");
const valid1 = { data: [] };
const valid2 = { errors: [] };
const valid3 = { meta: {} };
const valid4 = { jsonapi: {}, data: [] };
const valid5 = { links: {}, data: [] };
const valid6 = { included: [], data: [] };
const valid7 = {
  meta: {},
  jsonapi: {},
  data: [],
  links: {
    self: "//foo.com",
    related: "",
    pagination: { first: "", last: "", prev: "", next: "" }
  }
};
const valid8 = { data: { type: "", id: "" } };
const valid9 = { data: [{ type: "", id: "" }] };
const valid10 = { data: null };

const invalid1 = {};
const invalid2 = { data: [], errors: [] };
const invalid3 = { invalid: [] };
const invalid4 = { data: [], invalid: [] };
const invalid5 = { included: [] };
const invalid6 = { errors: [], included: [] };
const invalid7 = { meta: {}, included: [] };
const invalid8 = {
  data: [],
  links: {
    invalid: "",
    self: "//foo.com",
    related: "",
    pagination: { first: "", last: "", prev: "", next: "" }
  }
};
const invalid9 = { data: "" };
const invalid10 = { data: [{}] };

const validResource1 = { type: "", id: "" };
const validResource2 = {
  type: "",
  id: "",
  attributes: {},
  relationships: {},
  links: {},
  meta: {}
};
const validResource3 = {
  type: "",
  id: "",
  attributes: {},
  relationships: {},
  links: { self: "//foo.com" }
};
const validResource4 = {
  type: "",
  id: "",
  attributes: {},
  relationships: {},
  links: { related: { meta: {}, href: "" } }
};
const validResource5 = {
  type: "",
  id: "",
  relationships: { cover: { data: { type: "", id: "" } } }
};
const validResource6 = {
  type: "",
  id: "",
  relationships: { cover: { data: [{ type: "", id: "" }] } }
};

const validResource7 = {
  type: "",
  id: "",
  relationships: { cover: { data: null } }
};

const validResource8 = {
  type: "",
  id: "",
  relationships: { cover: { data: [] } }
};


const invalidResource1 = {};
const invalidResource2 = { id: "" };
const invalidResource3 = { type: "" };
const invalidResource4 = {
  type: "",
  id: "",
  attributes: {},
  relationships: {},
  links: {},
  meta: {},
  invalid: ""
};
const invalidResource5 = {
  type: "",
  id: "",
  relationships: { cover: { data: { type: "invalid" } } }
};

const invalidResource6 = {
  type: "",
  id: "",
  attributes: {},
  relationships: {},
  links: { related: undefined }
};

const invalidResource7 = {
  type: "",
  id: "",
  attributes: {},
  relationships: {},
  links: { related: { invalid: true } }
};

const invalidResource8 = {
  type: "",
  id: "",
  relationships: { cover: { missing: true } }
};

const invalidResource9 = {
  type: "",
  id: "",
  relationships: {
    invalid: false
  }
};

const invalidResource10 = {
  type: "",
  id: "",
  relationships: { cover: { data: { missing: true } } }
};

const invalidResource11 = {
  type: "",
  id: "",
  relationships: { cover: { data: undefined } }
};

const invalidResource12 = {
  type: "",
  id: "",
  relationships: { cover: { data: { type: "", id: "", meta: "", invalid: true } } }
};

const invalidResource13 = {
  type: "",
  id: "",
  relationships: { cover: { data: [], invalid: null } }
};

describe("isDocument", function() {
  it("handles falsy values", function() {
    expect(isDocument(null)).toBeFalsy();
    expect(isDocument(false)).toBeFalsy();
    expect(isDocument(undefined)).toBeFalsy();
  });

  it("MUST contain at least one of the following top-level members data, errors or meta", function() {
    expect(isDocument(valid1)).toBeTruthy();
    expect(isDocument(valid2)).toBeTruthy();
    expect(isDocument(valid3)).toBeTruthy();
    expect(isDocument(invalid1)).toBeFalsy();
    expect(isDocument(invalid10)).toBeFalsy();
  });

  it("MUST NOT contain data and errors", function() {
    expect(isDocument(invalid2)).toBeFalsy();
  });

  it("MAY contain data, errors, meta, jsonapi, links, included", function() {
    expect(isDocument(valid4)).toBeTruthy();
    expect(isDocument(valid5)).toBeTruthy();
    expect(isDocument(valid6)).toBeTruthy();
    expect(isDocument(invalid3)).toBeFalsy();
    expect(isDocument(invalid4)).toBeFalsy();
  });

  it("MUST NOT contain included when data is not present", function() {
    expect(isDocument(invalid5)).toBeFalsy();
    expect(isDocument(invalid6)).toBeFalsy();
    expect(isDocument(invalid7)).toBeFalsy();
  });

  it("MAY contain a links object with self, related or pagination", function() {
    expect(isDocument(valid7)).toBeTruthy();
    expect(isDocument(invalid8)).toBeFalsy();
  });

  it("MAY only containg a single resource object or an array of resource objects as primary data", function() {
    expect(isDocument(valid8)).toBeTruthy();
    expect(isDocument(valid9)).toBeTruthy();
    expect(isDocument(valid10)).toBeTruthy();
    expect(isDocument(invalid9)).toBeFalsy();
  });
});

describe("isResource", function() {
  it("handles falsy values", function() {
    expect(isResource(null)).toBeFalsy();
    expect(isResource(false)).toBeFalsy();
    expect(isResource(undefined)).toBeFalsy();
  });

  it("MUST contain id and type", function() {
    expect(isResource(validResource1)).toBeTruthy();
    expect(isResource(invalidResource1)).toBeFalsy();
    expect(isResource(invalidResource2)).toBeFalsy();
    expect(isResource(invalidResource3)).toBeFalsy();
  });

  it("MAY contain attributes, relationships, links and meta", function() {
    expect(isResource(validResource2)).toBeTruthy();
    expect(isResource(invalidResource4)).toBeFalsy();
  });

  it("MUST have valid links members", function() {
    expect(isResource(validResource3)).toBeTruthy();
    expect(isResource(validResource4)).toBeTruthy();
    expect(isResource(invalidResource6)).toBeFalsy();
    expect(isResource(invalidResource7)).toBeFalsy();
  });

  it("MUST contain valid relationships", function() {
    expect(isResource(validResource5)).toBeTruthy();
    expect(isResource(validResource6)).toBeTruthy();
    expect(isResource(validResource7)).toBeTruthy();
    expect(isResource(validResource8)).toBeTruthy();
    expect(isResource(invalidResource5)).toBeFalsy();
    expect(isResource(invalidResource8)).toBeFalsy();
    expect(isResource(invalidResource9)).toBeFalsy();
    expect(isResource(invalidResource10)).toBeFalsy();
    expect(isResource(invalidResource11)).toBeFalsy();
    expect(isResource(invalidResource12)).toBeFalsy();
    expect(isResource(invalidResource13)).toBeFalsy();
  });
});
