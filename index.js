"use strict";
// var error = require('debug')('jsonapi:error');
// var warn = require('debug')('jsonapi:warn');
// module.exports.migrate = function(object) {
// 	var resourceName = getResourceName(object);
// 	var result = {
// 		data: object[resourceName].map(function(item) {
// 			item.type = resourceName;
// 			Object.keys(item.links).forEach(function(key) {
// 				var linkage = [].concat(item.links[key]);
// 				var linkageType = object.links[ resourceName + '.' + key].type;
// 				var linkageSelf = object.links[ resourceName + '.' + key].href;
// 				linkage = linkage.map(function(linkageId) {
// 					return {
// 						id: linkageId,
// 						type: linkageType
// 					}
// 				});
// 				item.links[key] = {
// 					// self : linkageSelf,
// 					linkage : (linkage.length === 1)?	linkage[0] : linkage
// 				}
// 			});
// 			return item;
// 		})
// 	}
// 	return result;
// }



function flattenIncluded(object, included) {
	// deep clone	
	object = resolveAttributes(object);
	var result = resolveRelationships(object, included)
	delete result.type;
	return result;
}

function resolveRelationshipData(links, included) {
	if(!links.data) {
		return links;
	}
	
	if(Array.isArray(links.data)) {
		return links.data.map(function(link) {
			if(!included[link.type] || !included[link.type][link.id]) {
				return link.id;
			}
			return flattenIncluded(included[link.type][link.id], included);
		});
	} else {
		if(!included[links.data.type] || !included[links.data.type][links.data.id]) {
			return links.data.id;
		}
		return flattenIncluded(included[links.data.type][links.data.id], included);
	}
}

function resolveRelationships(resource, included) {
	if(!resource.relationships) {
		return resource;
	}
	
	// deep clone
	resource = JSON.parse(JSON.stringify(resource));
	
	Object.keys(resource.relationships).forEach(function(attribute) {
		resource[attribute] = resolveRelationshipData(resource.relationships[attribute], included);
	});

	delete resource.relationships;
	delete resource.type;
	return resource;
}

function resolveAttributes(resource) {
	// deep clone	
	var object = JSON.parse(JSON.stringify(resource));
	
	for (var name in object.attributes) {
		if( object.attributes.hasOwnProperty( name ) ) {
			object[name] = object.attributes[name];
		}
	}
	
	delete object.attributes;
	return object;
}


module.exports.parse = function(object) {
		
	// add and expose propper jsonapi validation
	if(!object.data) {
		return;
	}
		
	// clone our object, since valid source comes from a json this wont break.
	object = JSON.parse(JSON.stringify(object));

	var included = (object.included || []).reduce(function(result, resource, index, context) {
		var collection = result[resource.type] || {};
		collection[resource.id] = resource;
		result[resource.type] = collection;
		return result;
	}, {});

	var result = object.data.reduce(function(result, resource, index, context) {
		var collection = result[resource.type] || [];
		collection.push(resolveRelationships(resolveAttributes(resource), included));
		result[resource.type] = collection;
		return result;
	}, {})
	return result;
};

