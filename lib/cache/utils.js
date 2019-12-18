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
    }
};

module.exports = Utils;