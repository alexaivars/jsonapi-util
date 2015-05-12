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
	object = JSON.parse(JSON.stringify(object));
		
	var result = resolveLinks(object, included)
	for (var name in object.attributes) {
		if( object.attributes.hasOwnProperty( name ) ) {
			result[name] = object.attributes[name];
		}
	}
	delete result.type;
	delete result.attributes;
	return result;
}

function resolveLinkage(links, included) {
	if(!links.linkage) {
		return links;
	}
	
	if(Array.isArray(links.linkage)) {
		return links.linkage.map(function(link) {
			if(!included[link.type] || !included[link.type][link.id]) {
				return link.id;
			}
			return flattenIncluded(included[link.type][link.id], included);
		});
	} else {
		if(!included[links.linkage.type] || !included[links.linkage.type][links.linkage.id]) {
			return links.linkage.id;
		}
		return flattenIncluded(included[links.linkage.type][links.linkage.id], included);
	}
}

function resolveLinks(resource, included) {
	if(!resource.links) {
		return resource;
	}
	
	// clone
	resource = JSON.parse(JSON.stringify(resource));
	var attributes = Object.keys(resource.links);
	attributes.forEach(function(attribute) {
		resource[attribute] = resolveLinkage(resource.links[attribute], included);
	});

	delete resource.links;
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
		
	// clone our object, since valid source comes from a json this wont break.
	object = JSON.parse(JSON.stringify(object));

	var included = object.included || [];
	included = included.reduce(function(result, resource, index, context) {
		var collection = result[resource.type] || {};
		collection[resource.id] = resource;
		result[resource.type] = collection;
		return result;
	}, {});

	var result = object.data.reduce(function(result, resource, index, context) {
		var collection = result[resource.type] || [];
		collection.push(resolveLinks(resolveAttributes(resource), included));
		result[resource.type] = collection;
		return result;
	}, {})
	return result;
};

