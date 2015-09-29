"use strict";

function partial(func) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function partialFunc() {
    return func.apply(null, args.concat(Array.prototype.slice.call(arguments, 0)));
  };
}

function clone(item) {
	// clone our object, since valid source comes from a json this wont break.
	return JSON.parse(JSON.stringify(item));
}

function flattenIncluded(included, resource) {
	var object = resolveAttributes(included[resource.type][resource.id]);
	var result = resolveRelationships(included, object)
	return result;
}

function resolveData(included, data) {
	if(isIncluded(included, data)) {
		return flattenIncluded(included, data);
	} else {
		return data;
	}
}

function resolveRelationshipData(included, links) {
	if(!links.data) {
		return links;
	} else if(Array.isArray(links.data)) {
		return links.data.map(partial(resolveData, included));
	} else {
		return resolveData(included, links.data);
	}
}

function isIncluded(included, resource) {
	return !(!included[resource.type] || !included[resource.type][resource.id]);
}

function resolveRelationships(included, resource) {
	if(!resource.relationships) {
		return resource;
	}
	
	Object.keys(resource.relationships).forEach(function(attribute) {
		resource[attribute] = resolveRelationshipData(included, resource.relationships[attribute]);
	});

	delete resource.relationships;
	return resource;
}

function resolveAttributes(resource) {
	for (var name in resource.attributes) {
		if( resource.attributes.hasOwnProperty( name ) ) {
			resource[name] = resource.attributes[name];
		}
	}
	
	delete resource.attributes;
	return resource;
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
			{ status: '400', title: 'parse error', detail: 'supplied object was undefined' }
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

function parseResource(included, item) {
	return resolveRelationships(included, resolveAttributes(clone(item)));
} 

module.exports = function(object) {
		
	// add and expose propper jsonapi validation
	var errors = error(object);
	if(errors) {
		return { errors : errors }
	}
		
	var included = (object.included || []).reduce(function groupByType(result, resource, index, context) {
		var collection = result[resource.type] || {};
		collection[resource.id] = resource;
		result[resource.type] = collection;
		return result;
	}, {});

	return {
		data :	object.data.map(partial(parseResource, included))
	}
};

