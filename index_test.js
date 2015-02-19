
"use strict";

var assert = require('chai').assert,
		util = require('./index.js');

describe('JSONAPI helper tool', function() {
	it('missing links will resolve to id', function() {
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
				"posts": [{
					"id": "1",
					"title": "Rails is Omakase",
					"author": "9",
					"comments": [ "0", "1" ]
					}, {
					"id": "2",
					"title": "The Parley Letter",
					"author": "9",
					"comments": [ "2" ]
				 }]
		};
	
		var result = util.parse(actual);
		
		assert.deepEqual(result, expected);
	});

	it('it parse a linked collection', function() {

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
				 }}],
				"linked": {
					"people": [{
						"id": "9",
						"name": "@d2h"
					}],
					"comments": [{
						"id": "0",
						"body": "Mmmmmakase"
					}, {
						"id": "1",
						"body": "I prefer unagi"
					}, {
						"id": "2",
						"body": "What's Omakase?"
					}]
				}
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

	it('it merges a compound resource', function() {
		var actual = {
			"links": {
				"posts.comments": {
					"href": "http://example.com/comments/{posts.comments}",
					"type": "comments"
				},
				"comments.picture": {
					"href": "http://example.com/images/{comments.picture}",
					"type": "images"
				}
			},
			"posts": [{
				"id": "1",
				"title": "Rails is Omakase",
				"links": {
					"comments": [ "1", "2" ]
				}
			}],
			"linked": {
				"images": [{
					"id": "1",
					"src": "http://example.com/static/picture_1.jpg"
				}, {
					"id": "2",
					"src": "http://example.com/static/picture_2.jpg"
				}, {
					"id": "3",
					"src": "http://example.com/static/picture_3.jpg"
				}],
				"comments": [{
					"id": "1",
					"body": "Mmmmmakase",
					"links": {
						"picture": ["1"]
					}
				}, {
					"id": "2",
					"body": "I prefer unagi",
					"links": {
						"picture": ["2", "3"]
					}
				}]
			}
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
