'use strict';

const Config = require('../../config');
const endpointDefinitions = require(Config.cache.endpoints);
const PathMatcher = require("../utils/pathmatcher");

const Utils = {
    getEndpointDefinition: (cacheKey) => {
        let keys = Object.keys(endpointDefinitions);
        for (let i = 0; i < keys.length; i++) {
            if (PathMatcher.match(keys[i], cacheKey)) {
                return keys[i];
            }
        }
        return null;
    },

    requestKey: (request) => {
        const key = `/${request.params.path}` + (request.url.search || '');
        return encodeURIComponent(key);
    }
};

module.exports = Utils;