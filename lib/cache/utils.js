'use strict';

const Config = require('../../config');
const endpoints = require(Config.cache.endpoints);
const PathMatcher = require("../utils/pathmatcher");

const Utils = {
    getEndpointDefinition: (cacheKey) => {
        let keys = Object.keys(endpoints);
        for (let i = 0; i < keys.length; i++) {
            if (PathMatcher.match(keys[i], cacheKey)) {
                return keys[i];
            }
        }
        return null;
    },

    requestKey: (request) => {
        return `/${request.params.path}`;
    }
};

module.exports = Utils;