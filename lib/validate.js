"use strict";

function checkTopLevelMembersMust(obj) {
  var must = ["data", "errors", "meta"];
  return Object.keys(obj).some(function(key) {
    return must.indexOf(key) >= 0;
  })
    ? obj
    : false;
}

function checkTopLevelMembersCombo(obj) {
  return obj.data && obj.errors ? false : obj;
}

function checkTopLevelMembersMay(obj) {
  var may = ["data", "errors", "meta", "jsonapi", "links", "included"];
  return Object.keys(obj).some(function(key) {
    return may.indexOf(key) < 0;
  })
    ? false
    : obj;
}

function checkTopLevelMembersIncluded(obj) {
  if (obj.included) {
    return obj.data ? obj : false;
  }
  return obj;
}

function checkTopLevelMembersLinks(obj) {
  if (obj.links === undefined) return obj;
  var may = ["self", "related", "pagination"];
  return Object.keys(obj.links).some(function(key) {
    return may.indexOf(key) < 0;
  })
    ? false
    : obj;
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

function checkResourceObjectMust(obj) {
  return obj.hasOwnProperty("id") && obj.hasOwnProperty("type") ? obj : false;
}

function checkResourceObjectMay(obj) {
  var may = ["id", "type", "attributes", "relationships", "links", "meta"];
  return Object.keys(obj).some(function(key) {
    return may.indexOf(key) < 0;
  })
    ? false
    : obj;
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
  return Object.keys(obj.relationships).some(function(key) {
    return !isRelationshipsObject(obj.relationships[key]);
  })
    ? false
    : obj;
}

function checkLinksMember(obj) {
  if (typeof obj === "string") return obj;
  if (typeof obj === "undefined" || obj === null) return false;
  var may = ["href", "meta"];
  return Object.keys(obj).some(function(key) {
    return may.indexOf(key) < 0;
  })
    ? false
    : obj;
}

function checkRelationshipsObjectMust(obj) {
  var must = ["links", "data", "meta"];
  return Object.keys(obj).some(function(key) {
    return must.indexOf(key) >= 0;
  })
    ? obj
    : false;
}

function checkRelationshipsObjectData(obj) {
  if (obj.data === null) return obj;
  if (Array.isArray(obj.data) && obj.data.length === 0) return obj;
  if (
    Array.isArray(obj.data) &&
    !Object.keys(obj.data).some(function(key) {
      return !isResourceIdentifierObject(obj.data[key]);
    })
  )
    return obj;
  if (!isResourceIdentifierObject(obj.data)) return false;
  return obj;
}

function checkResourceIdentifierObjectMust(obj) {
  return obj.hasOwnProperty("id") && obj.hasOwnProperty("type") ? obj : false;
}

function checkResourceIdentifierObjectMay(obj) {
  var may = ["id", "type", "meta"];
  return Object.keys(obj).some(function(key) {
    return may.indexOf(key) < 0;
  })
    ? false
    : obj;
}

function isResourceIdentifierObject(obj) {
  return (
    obj &&
    checkResourceIdentifierObjectMust(obj) &&
    checkResourceIdentifierObjectMay(obj)
  );
}

function isRelationshipsObject(obj) {
  return (
    obj &&
    checkRelationshipsObjectMust(obj) &&
    checkRelationshipsObjectData(obj)
  );
}

function isResource(obj) {
  return (
    obj &&
    checkResourceObjectMust(obj) &&
    checkResourceObjectMay(obj) &&
    checkResourceObjectLinks(obj) &&
    checkResourceObjectRelationships(obj)
  );
}

function isDocument(obj) {
  return (
    obj &&
    checkTopLevelMembersMust(obj) &&
    checkTopLevelMembersMay(obj) &&
    checkTopLevelMembersCombo(obj) &&
    checkTopLevelMembersIncluded(obj) &&
    checkTopLevelMembersLinks(obj) &&
    checkTopLevelMembersData(obj)
  );
}

module.exports.isDocument = isDocument;
module.exports.isResource = isResource;
