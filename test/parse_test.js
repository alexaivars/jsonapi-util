
"use strict";

var assert = require('chai').assert,
		util = require('../index');

describe('JSONAPI helper tool', function() {
	
	it('parses relationship data', function() {

		var actual = {
				"data": [
					{
						"type": "posts",
						"id": "1",
						"attributes": {
							"title": "Rails is Omakase"
						},
						"relationships": {
							"author": {
								"data": { "type": "people", "id": "9" }
							},
							"comments": {
								"data": [
									{ "type": "comments", "id": "0" },
									{ "type": "comments", "id": "1" }
								]
							}
						}
					},
					{
						"type": "posts",
						"id": "2",
						"attributes": {
							"title": "The Parley Letter"
						},
						"relationships": {
							"author": {
								"data": { "type": "people", "id": "9" }
							},
							"comments": {
								"data": [{ "type": "comments", "id": "2" }]
							}
						}
					}
				],
				"included" : [
					{
						"type": "people",
						"id": "9",
						"attributes": {
							"name" : "@d2h"
						}
					},
					{
						"type": "comments",
						"id": "0",
						"attributes": {
							"body": "Mmmmmakase"
						}
					},
					{
						"type": "comments",
						"id": "1",
						"attributes": {
							"body": "I prefer unagi"
						}
					},
					{
						"type": "comments",
						"id": "2",
						"attributes": {
							"body": "What's Omakase?"
						}
					}
				]
			};
		
		var expected = {
				"data": [{
					"type": "posts",
					"id": "1",
					"title": "Rails is Omakase",
					"author": {
						"type": "people",
						"id": "9",
						"name": "@d2h"
					},
					"comments": [{
						"type": "comments",
						"id": "0",
						"body": "Mmmmmakase"
					}, {
						"type": "comments",
						"id": "1",
						"body": "I prefer unagi"
					}]
					}, {
					"type": "posts",
					"id": "2",
					"title": "The Parley Letter",
					"author": {
						"type": "people",
						"id": "9",
						"name": "@d2h"
					},
					"comments": [{
						"type": "comments",
						"id": "2",
						"body": "What's Omakase?"
					}]
				 }]
		};
		
		assert.deepEqual(util.parse(actual), expected);
	});

	it('should parse related resources with deep structure', function() {
		
		var actual = {
				"data": [
					{
						"type": "foo",
						"id": "foo-id",
						"relationships": {
							"list": {
								"data": { "type": "bar", "id": "bar-id" }
							}
						}
					},
				],
				"included" : [
					{
						"type": "bar",
						"id": "bar-id",
						"attributes": {
							"deep" : [
								{ "1": "a"},
								{ "2": "b"},
								{ "3": "c"}
							]
						}
					}
				]
			};

		var expected = {
					"data": [
						{
							"type": "foo",
							"id": "foo-id",
							"list": {
								"type": "bar",
								"id": "bar-id",
								"deep": [
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
		
		assert.deepEqual(util.parse(actual), expected);

		// console.log(JSON.stringify(util.parse(actual), null, 2));

	});
	it('should return an error object when passed a empty response', function() {
		
		var actual = undefined;
		var expected = {
			"errors": [
				{
					"status": "400",
					"title": "parse error",
					"detail": "supplied object was undefined"
				}
			]
		}
		
		assert.deepEqual(util.parse(actual), expected);

		// console.log(JSON.stringify(util.parse(actual), null, 2));

	});

	it('should return an error object when containing invalid top level members', function() {
		
		var actual = {
			foo: true,
			bar: true
		};
		var expected = {
			"errors": [
				{
					"status": "400",
					"title": "parse error",
					"detail": "supplied object contains the following invalid key's foo, bar"
				}
			]
		}

		// console.log(JSON.stringify(util.parse(actual), null, 2));
		assert.deepEqual(util.parse(actual), expected);

	});

	it('should return an error object when missing must top-level members', function() {
		
		var actual = {
		};
		var expected = {
			"errors": [
				{
					"status": "400",
					"title": "parse error",
					"detail": "supplied object MUST contain at least one of the following top-level members: data, errors, meta"
				}
			]
		}

		assert.deepEqual(util.parse(actual), expected);

	});

	it('should return an error object if data and errors are definen in the same object', function() {
		
		var actual = {
			errors : {},
			data: []
		};

		var expected = {
			"errors": [
				{
					"status": "400",
					"title": "parse error",
					"detail": "top-level members data and errors MUST NOT coexist in the same object"
				}
			]
		}

		// console.log(JSON.stringify(util.parse(actual), null, 2));
		assert.deepEqual(util.parse(actual), expected);

	});

	it('missing links will not be resolved', function() {
		var actual = {
			"data": [{
				"id": "1",
				"type": "posts",
				"title": "Rails is Omakase",
				"relationships": {
					"author":{
						"data": { "type": "people", "id": "9" }
					},
					"comments":{
						"data": [
							{ "type": "comments", "id": "0" },
							{ "type": "comments", "id": "1" }
						]
					}
				}
			}]
		};
		
		var expected = {
				"data": [{
					"id": "1",
					"type": "posts",
					"title": "Rails is Omakase",
					"author": { "type": "people", "id": "9" },
					"comments": [ 
						{ "type": "comments", "id": "0" },
						{ "type": "comments", "id": "1" }
					]
				 }]
		};
	
		var result = util.parse(actual);
		assert.deepEqual(result, expected);
	});



	it('it merges a compound resource', function() {
		var actual = {
			"data": [{
				"id": "1",
				"type": "posts",
				"title": "Rails is Omakase",
				"relationships": {
					"comments":{
						"data": [
							{ "type": "comments", "id": "1" },
							{ "type": "comments", "id": "2" }
						]
					}
				}
			}],
			"included": [{
					"type": "images",
					"id": "1",
					"attributes": {
						"src": "http://example.com/static/picture_1.jpg"
					}
				}, {
					"type": "images",
					"id": "2",
					"attributes": {
						"src": "http://example.com/static/picture_2.jpg"
					}
				}, {
					"type": "images",
					"id": "3",
					"attributes": {
						"src": "http://example.com/static/picture_3.jpg"
					}
				},
				{
					"type": "comments",
					"id": "1",
					"attributes": {
						"body": "Mmmmmakase"
					},
					"relationships": {
						"picture":{
							"data": [
								{ "type": "images", "id": "1" }
							]
						}
					}
				},
				{
					"type": "comments",
					"id": "2",
					"attributes": {
						"body": "I prefer unagi",
					},
					"relationships": {
						"picture":{
							"data": [
								{ "type": "images", "id": "2" },
								{ "type": "images", "id": "3" }
							]
						}
					}
			}]
		};

		var expected = {
			"data": [{
					"type": "posts",
					"id": "1",
					"title": "Rails is Omakase",
					"comments": [{
						"type": "comments",
						"id": "1",
						"body": "Mmmmmakase",
						"picture": [{
							"type": "images",
							"id": "1",
							"src": "http://example.com/static/picture_1.jpg"
						}]
					},{
						"type": "comments",
						"id": "2",
						"body": "I prefer unagi",
						"picture": [{
							"type": "images",
							"id": "2",
							"src": "http://example.com/static/picture_2.jpg"
						},{
							"type": "images",
							"id": "3",
							"src": "http://example.com/static/picture_3.jpg"
						}]
					}]
				}]
		};
		
		assert.deepEqual(util.parse(actual), expected);

	});
});
