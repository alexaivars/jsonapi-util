"use strict";

var _ = require('lodash');
var error = require('debug')('jsonapi:error');
var warn = require('debug')('jsonapi:warn');

function getResourceName(object) {
	if(!object) {
		error('can not get resource name of undefined object');
		return null;
	}

	var keys = _.without(_.keys(object), 'links', 'linked', 'meta');
	if(keys.length !== 1) {
		error('%s is malformatted', JSON.stringify(object, undefined, 4));
	}
	return keys[0];
}

function getLinkById(linked, id) {
	return _.find(linked, function(link) { 
		return link.id === id;
	});
}

function parseItem(item, name, target, linked, links) {
	_.each(item.links, function(link, property) {
		
		if(!links[name + '.' + property]) {
			return;	
		}
		
		var propertyType = links[name + '.' + property].type;
		
		if(!linked || !linked[propertyType]) {
			item[property] = link;
		} else {
			if(_.isArray(link)) {
				item[property] = _.reduce(link, function(result, id) {
					var link = getLinkById(linked[propertyType], id);
					if(link === null || link === undefined) {
						warn('unable to resolve resource %s included from %s in %s', id, links[name + '.' + property].href, item.id);
					} else {
						result.push(getLinkById(linked[propertyType], id));
					}
					return result;
				}, []);	
			} else {
				item[property] = getLinkById(linked[propertyType], link);
			}
		}
	});
	delete item.links;
}

function resolveLinked(container, linked, links) {
	_.each(container, function(collection, type) {
		_.each(collection, function(item) {
			if(item) {
				parseItem(item, type, container, linked, links);
			} else {
				error('resolveLinked can\'t parse undefined item');
			}
		});
	});
}

module.exports.getResourceName = getResourceName;
module.exports.getResource = function(object) {
	var name = getResourceName(object);
	var resources = object[name];
	
	if(resources.length === 1) {
		return resources[0];
	}

	if(resources.length > 1) {
		warn('resource look\'s like the resource containeris a collection but will return the first item');
		return resources[0];
	}

	if(resources.length === 0) {
		warn('the resource container is empty');
		return null;
	}
};

module.exports.parse = function(object) {
	var result = {};
	var name = getResourceName(object); 
	var linked = _.cloneDeep(object.linked);	

	result[name] = _.cloneDeep(object[name]);
	
	resolveLinked(linked, linked, object.links);
	resolveLinked(result, linked, object.links);

	return result;
};

module.exports.migrate = function(object) {
	var resourceName = getResourceName(object);
	var result = {
		data: object[resourceName].map(function(item) {
			item.type = resourceName;
			Object.keys(item.links).forEach(function(key) {
				var linkage = [].concat(item.links[key]);
				var linkageType = object.links[ resourceName + '.' + key].type;
				var linkageSelf = object.links[ resourceName + '.' + key].href;
				linkage = linkage.map(function(linkageId) {
					return {
						id: linkageId,
						type: linkageType
					}
				});
				item.links[key] = {
					// self : linkageSelf,
					linkage : (linkage.length === 1)?	linkage[0] : linkage
				}
			});
			return item;
		})
	}
	return result;
}
