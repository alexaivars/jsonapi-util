"use strict";

function checkTopLevelMembersMust(obj) {
	if(!obj) return false;
	var must = ['data', 'errors', 'meta'];
	return Object.keys(obj).some(function (key) { return must.indexOf(key) >= 0; })?obj:false;
}

function checkTopLevelMembersCombo(obj) {
	if(!obj) return false;
	return (obj.data && obj.errors)?false:obj;
}

function checkTopLevelMembersMay(obj) {
	if(!obj) return false;
	var may = ['data', 'errors', 'meta', 'jsonapi', 'links', 'included'];
	return Object.keys(obj).some(function (key) { return may.indexOf(key) < 0; })?false:obj;
}

function checkTopLevelMembersIncluded(obj) {
	if(!obj) return false;
	if(obj.included) {
		return obj.data?obj:false;
	}
	return obj
}

function checkTopLevelMembersLinks(obj) {
	if(!obj) return false;
	if(!obj.links) return obj;
	var may = ['self', 'related', 'pagination'];
	return Object.keys(obj.links).some(function (key) { return may.indexOf(key) < 0; })?false:obj;
}

function checkTopLevelMembersData(obj) {
	if(!obj) return false;
	if(!obj.data) return obj;
	return obj.data.some(function (ResourceObject) { return !validateResourceObject(ResourceObject); })?false:obj;
}

function checkResourceObjectMust(obj) {
	if(!obj) return false;
	return (obj.hasOwnProperty('id') && obj.hasOwnProperty('type'))?obj:false;
}

function checkResourceObjectMay(obj) {
	if(!obj) return false;
	var may = ['id', 'type', 'attributes', 'relationships', 'links', 'meta'];
	return Object.keys(obj).some(function (key) { return may.indexOf(key) < 0; })?false:obj;
}

function checkResourceObjectLinks(obj) {
	if(!obj) return false;
	if(!obj.links) return obj;
	return Object.keys(obj.links).some(function (key) { return !checkLinksMember(obj.links[key]); })?false:obj;
}

function checkLinksMember(obj) {
	if(typeof obj === 'string') return obj;
	if(typeof obj === 'undefined' || obj === null) return false;
	var may = ['href', 'meta'];
	return Object.keys(obj).some(function (key) { return may.indexOf(key) < 0; })?false:obj;
}

function validateResourceObject(obj) {
	if(!obj) return false;
	obj = checkResourceObjectMust(obj);
	obj = checkResourceObjectMay(obj);
	obj = checkResourceObjectLinks(obj);
	return obj?true:false;
}

function validateTopLevel(obj) {
	obj = checkTopLevelMembersMust(obj);
	obj = checkTopLevelMembersMay(obj);
	obj = checkTopLevelMembersCombo(obj);
	obj = checkTopLevelMembersIncluded(obj);
	obj = checkTopLevelMembersLinks(obj);
	obj = checkTopLevelMembersData(obj);
	return obj?true:false;
};

module.exports.isDocument = validateTopLevel;
module.exports.isResource = validateResourceObject;


