"use strict";

function flattenIncluded(resource, included) {
	// deep clone	
	var object = resolveAttributes(included[resource.type][resource.id]);
	var result = resolveRelationships(object, included)
	return result;
}

function resolveRelationshipData(links, included) {
	if(!links.data) {
		return links;
	}
	
	if(Array.isArray(links.data)) {
		return links.data.map(function(link) {
			return resolveData(link, included);
		});
	} else {
		return resolveData(links.data, included);
	}
}


function isIncluded(resource, included) {
	return !(!included[resource.type] || !included[resource.type][resource.id]);
}

function resolveData(data, included) {
	if(isIncluded(data, included)) {
		return flattenIncluded(data, included);
	} else {
		return data;
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

function error(object) {
	
	var VALID_KEYS = {
		data: true,
		errors: true,
		meta: true,
		jsonapi: true,
		links: true,
		included: true,
	}

	if(!object) {
		return [
			{ status: '400', title: 'Parse error', detail: 'Supplied object was undefined' }
		];
	}

	var invalid = Object.keys(object).filter(function(key) { return VALID_KEYS[key]?false:true; });

	if(invalid.length > 0) {
		return [
			{ status: '400', title: 'parse error', detail: 'supplied object contains the following invalid key\'s ' + invalid.join(', ') }
		];	
	}
	
	if(!object.data && !object.errors && !object.meta) {
		return [
			{ status: '400', title: 'parse error', detail: 'supplied object MUST contain at least one of the following top-level members: data, errors, meta' }
		];
	}

	if(object.data && object.errors) {
		return [
			{ status: '400', title: 'parse error', detail: 'top-level members data and errors MUST NOT coexist in the same object' }
		];
	}

	return false;
}


module.exports.parse = function(object) {
		
	// add and expose propper jsonapi validation
	var errors = error(object);
	if(errors) {
		return { errors : errors }
	}
		
	// clone our object, since valid source comes from a json this wont break.
	object = JSON.parse(JSON.stringify(object));

	var included = (object.included || []).reduce(function reduceIncludedResources(result, resource, index, context) {
		var collection = result[resource.type] || {};
		collection[resource.id] = resource;
		result[resource.type] = collection;
		return result;
	}, {});

	var result = object.data.reduce(function reducePrimaryData(result, resource, index, context) {
		var collection = result.data || [];
		collection.push(resolveRelationships(resolveAttributes(resource), included));
		result.data = collection;
		return result;
	}, {})
	return result;
};

