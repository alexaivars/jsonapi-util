"use strict";

function checkTopLevelMembersMust(obj) {
  var must = ["data", "errors", "meta"];
  return (
    !checkMustHaveAllKeys(obj, ["data", "errors"]) &&
    !(obj.hasOwnProperty("included") && !obj.hasOwnProperty("data")) &&
    checkMustHaveOneKey(obj, must) &&
    obj
  );
}

function checkTopLevelMembersLinks(obj) {
  if (obj.links === undefined) return obj;
  var may = ["self", "related", "pagination"];
  return checkMayHaveKeys(obj.links, may) && obj;
}

function checkTopLevelMembersData(obj) {
  if (obj.data === undefined) return obj;
  if (obj.data === null) return obj;
  if (Array.isArray(obj.data)) {
    return obj.data.some(function(ResourceObject) {
      return !isResource(ResourceObject);
    })
      ? false
      : obj;
  }

  return isResource(obj.data);
}

function checkResourceObjectLinks(obj) {
  if (!obj.links) return obj;
  return Object.keys(obj.links).some(function(key) {
    return !checkLinksMember(obj.links[key]);
  })
    ? false
    : obj;
}

function checkResourceObjectRelationships(obj) {
  if (!obj.relationships) return obj;
  return (
    !Object.keys(obj.relationships).some(function(key) {
      return !isRelationshipsObject(obj.relationships[key]);
    }) && obj
  );
}

function checkLinksMember(obj) {
  if (typeof obj === "string") return obj;
  if (typeof obj === "undefined" || obj === null) return false;
  var may = ["href", "meta"];
  return checkMayHaveKeys(obj, may) && checkMayHaveKeys(obj, may) && obj;
}

function checkMustHaveAllKeys(obj, must) {
  return (
    must.filter(function(key) {
      return !obj.hasOwnProperty(key);
    }).length === 0
  );
}

function checkMustHaveOneKey(obj, must) {
  return (
    must
      .map(function(key) {
        return obj.hasOwnProperty(key);
      })
      .filter(function(key) {
        return key;
      }).length > 0
  );
}

function checkMayHaveKeys(obj, may) {
  return (
    Object.keys(obj).filter(function(key) {
      return may.indexOf(key) < 0;
    }).length === 0
  );
}

function checkRelationshipsObjectData(obj) {
  if (obj.data === null) return obj;
  if (Array.isArray(obj.data) && obj.data.length === 0) return obj;
  if (
    Array.isArray(obj.data) &&
    !Object.keys(obj.data).some(function(key) {
      return !isResourceIdentifierObject(obj.data[key]);
    })
  ) {
    return obj;
  }
  if (!isResourceIdentifierObject(obj.data)) return false;
  return obj;
}

function checkResourceIdentifierObjectMust(obj) {
  return obj.hasOwnProperty("id") && obj.hasOwnProperty("type") && obj;
}

function isResourceIdentifierObject(obj) {
  var may = ["id", "type", "meta"];
  return (
    obj &&
    checkResourceIdentifierObjectMust(obj) &&
    checkMayHaveKeys(obj, may)
  );
}

function isRelationshipsObject(obj) {
  var must = ["links", "data", "meta"];
  var may = ["links", "data", "meta"];
  return (
    obj &&
    checkMustHaveOneKey(obj, must) && 
    checkMayHaveKeys(obj, may) &&
    checkRelationshipsObjectData(obj)
  );
}

function isResource(obj) {
  var must = ["id", "type"];
  var may = ["id", "type", "attributes", "relationships", "links", "meta"];

  return (
    obj &&
    checkMustHaveAllKeys(obj, must) &&
    checkMayHaveKeys(obj, may) &&
    checkResourceObjectLinks(obj) &&
    checkResourceObjectRelationships(obj)
  );
}

function isDocument(obj) {
  var may = ["data", "errors", "meta", "jsonapi", "links", "included"];
  return (
    obj &&
    checkMayHaveKeys(obj, may) &&
    checkTopLevelMembersMust(obj) &&
    checkTopLevelMembersLinks(obj) &&
    checkTopLevelMembersData(obj)
  );
}

module.exports.isDocument = isDocument;
module.exports.isResource = isResource;
