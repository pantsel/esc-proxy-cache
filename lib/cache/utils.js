'use strict';

const Config = require('../../config');
const endpointDefinitions = require(Config.cache.endpoints);
const PathMatcher = require("../utils/pathmatcher");

const Utils = {
    getEndpointDefinition: (path) => {
        let keys = Object.keys(endpointDefinitions);
        for (let i = 0; i < keys.length; i++) {
            if (PathMatcher.match(keys[i], `/${path}`)) {
                return keys[i];
            }
        }
        return null;
    },

    getEndpointDefinitionFromEncodedUri: (encoded) => {
        const decoded = decodeURIComponent(encoded);
        const path = decoded.split('?')[0];
        let keys = Object.keys(endpointDefinitions);
        for (let i = 0; i < keys.length; i++) {
            if (PathMatcher.match(keys[i], path)) {
                return keys[i];
            }
        }
        return null;
    },

    requestKey: (request) => {
        const key = `/${request.params.path}` + (request.url.search || '');
        return Utils.encodePath(key);
    },

    encodePath: (path) => {
        return encodeURIComponent(path);
    },

    includesSomeDefinedHeaders: (request) => {
        if(!Config.proxy.matchHeaders || !Config.proxy.matchHeaders.length) {
            return true;
        }
        return Config.proxy.matchHeaders.some(prop => prop in request.headers);
    },
    shouldBeHandled: (request) => {
        return request.method.toLowerCase() === ('get' || 'head')
                && Utils.getEndpointDefinition(request.params.path)
                && Utils.includesSomeDefinedHeaders(request)
    }
};

module.exports = Utils;