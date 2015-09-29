
"use strict";

var assert = require('chai').assert,
		isDocument = require('../index').isDocument,
		isResource = require('../index').isResource;

var valid1 = { "data": [] };
var valid2 = { "errors": [] };
var valid3 = { "meta": {} };
var valid4 = { "jsonapi": {}, "data": [] };
var valid5 = { "links": {}, "data": [] };
var valid6 = { "included": [], "data": [] };
var valid7 = { "meta":{}, "jsonapi":{}, "data": [], "links":{ "self": "//foo.com", "related": "", "pagination":{ "first":"", "last":"", "prev":"", "next":"" } } };

var invalid1 = {}
var invalid2 = { "data":[], "errors":[] }
var invalid3 = { "invalid":[] }
var invalid4 = { "data":[], "invalid":[] }
var invalid5 = { "included":[] }
var invalid6 = { "errors":[], "included":[] }
var invalid7 = { "meta":{}, "included":[] }
var invalid8 = { "data": [], "links":{ "invalid": "", "self": "//foo.com", "related": "", "pagination":{ "first":"", "last":"", "prev":"", "next":"" } } };

var validResource1 = { "type":"", "id":"" };
var validResource2 = { "type":"", "id":"", "attributes":{}, "relationships":{}, "links":{}, "meta": {} };
var validResource3 = { "type":"", "id":"", "attributes":{}, "relationships":{}, "links":{ "self": "//foo.com" } };
var validResource4 = { "type":"", "id":"", "attributes":{}, "relationships":{}, "links":{ "related": { "meta":{}, "href": "" } } };

var invalidResource1 = { };
var invalidResource2 = { "id":"" };
var invalidResource3 = { "type":"" };
var invalidResource4 = { "type":"", "id":"", "attributes":{}, "relationships":{}, "links":{}, "meta": {}, "invalid":"" };


describe('isDocument', function() {
	it('MUST contain at least one of the following top-level members data, errors or meta', function() {
		assert.isTrue(isDocument(valid1));
		assert.isTrue(isDocument(valid2));
		assert.isTrue(isDocument(valid3));
		assert.isFalse(isDocument(invalid1));
	});
	
	it('MUST NOT contain data and errors', function() {
		assert.isFalse(isDocument(invalid2));
	});

	it('MAY contain data, errors, meta, jsonapi, links, included', function() {
		assert.isTrue(isDocument(valid4));
		assert.isTrue(isDocument(valid5));
		assert.isTrue(isDocument(valid6));
		assert.isFalse(isDocument(invalid3));
		assert.isFalse(isDocument(invalid4));
	});

	it('MUST NOT contain included when data is not present', function() {
		assert.isFalse(isDocument(invalid5));
		assert.isFalse(isDocument(invalid6));
		assert.isFalse(isDocument(invalid7));
	});
	
	it('MAY contain a links object with self, related or pagination', function() {
		assert.isTrue(isDocument(valid7));
		assert.isFalse(isDocument(invalid8));
	});
});

describe('isResource', function() {
	it('MUST contain id and type', function() {
		assert.isTrue(isResource(validResource1));
		assert.isFalse(isResource(invalidResource1));
		assert.isFalse(isResource(invalidResource2));
		assert.isFalse(isResource(invalidResource3));
	});
	
	it('MAY contain attributes, relationships, links and meta', function() {
		assert.isTrue(isResource(validResource2));
		assert.isFalse(isResource(invalidResource4));
	});
	
	it('MUST have valid links members', function() {
		assert.isTrue(isResource(validResource3));
		assert.isTrue(isResource(validResource4));
	});
});

