
"use strict";

var assert = require('chai').assert,
		util = require('./index.js');

describe('JSONAPI helper tool', function() {
	
	it.skip('migrates legacy version to 1.0', function() {
		var actual = {
				"links": {
					"posts.author": {
						"href": "http://example.com/people/{posts.author}",
						"type": "people"
					},
					"posts.comments": {
						"href": "http://example.com/comments/{posts.comments}",
						"type": "comments"
					}
				},
				"posts": [{
					"id": "1",
					"title": "Rails is Omakase",
					"links": {
						"author": "9",
						"comments": [ "0", "1" ]
					}}, {
					"id": "2",
					"title": "The Parley Letter",
					"links": {
						"author": "9",
						"comments": [ "2" ]
				 }}]
			};
			
		var expected = {
				"data": [
					{
						"type": "posts",
						"id": "1",
						"title": "Rails is Omakase",
						"links": {
							"author": {
								"linkage": { "type": "people", "id": "9" }
							},
							"comments": {
								"linkage": [
									{ "type": "comments", "id": "0" },
									{ "type": "comments", "id": "1" }
								]
							}
						}
					},
					{
						"type": "posts",
						"id": "2",
						"title": "The Parley Letter",
						"links": {
							"author": {
								"linkage": { "type": "people", "id": "9" }
							},
							"comments": {
								"linkage": { "type": "comments", "id": "2" }
							}
						}
					}
				]
			};

		var result = util.migrate(actual);

		// console.log(JSON.stringify(result, null, 2));
		assert.deepEqual(result, expected);

	});
	
	it('it parse a linked collection', function() {

		var actual = {
				"data": [
					{
						"type": "posts",
						"id": "1",
						"attributes": {
							"title": "Rails is Omakase"
						},
						"links": {
							"author": {
								"linkage": { "type": "people", "id": "9" }
							},
							"comments": {
								"linkage": [
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
						"links": {
							"author": {
								"linkage": { "type": "people", "id": "9" }
							},
							"comments": {
								"linkage": [{ "type": "comments", "id": "2" }]
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
				"posts": [{
					"id": "1",
					"title": "Rails is Omakase",
					"author": {
						"id": "9",
						"name": "@d2h"
					},
					"comments": [{
						"id": "0",
						"body": "Mmmmmakase"
					}, {
						"id": "1",
						"body": "I prefer unagi"
					}]
					}, {
					"id": "2",
					"title": "The Parley Letter",
					"author": {
						"id": "9",
						"name": "@d2h"
					},
					"comments": [{
						"id": "2",
						"body": "What's Omakase?"
					}]
				 }]
		};
		assert.deepEqual(util.parse(actual), expected);
	});
	

	it('missing links will resolve to id', function() {
		var actual = {
			"data": [{
				"id": "1",
				"type": "posts",
				"title": "Rails is Omakase",
				"links": {
					"author":{
						"linkage": { "type": "people", "id": "9" }
					},
					"comments":{
						"linkage": [
							{ "type": "comments", "id": "0" },
							{ "type": "comments", "id": "1" }
						]
					}
				}
			}]
		};
		
		var expected = {
				"posts": [{
					"id": "1",
					"title": "Rails is Omakase",
					"author": "9",
					"comments": [ "0", "1" ]
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
				"links": {
					"comments":{
						"linkage": [
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
					"links": {
						"picture":{
							"linkage": [
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
					"links": {
						"picture":{
							"linkage": [
								{ "type": "images", "id": "2" },
								{ "type": "images", "id": "3" }
							]
						}
					}
			}]
		};

		var expected = {
			"posts": [{
					"id": "1",
					"title": "Rails is Omakase",
					"comments": [{
						"id": "1",
						"body": "Mmmmmakase",
						"picture": [{
							"id": "1",
							"src": "http://example.com/static/picture_1.jpg"
						}]
					},{
						"id": "2",
						"body": "I prefer unagi",
						"picture": [{
							"id": "2",
							"src": "http://example.com/static/picture_2.jpg"
						},{
							"id": "3",
							"src": "http://example.com/static/picture_3.jpg"
						}]
					}]
				}]
		};

		assert.deepEqual(util.parse(actual), expected);

	});
});
