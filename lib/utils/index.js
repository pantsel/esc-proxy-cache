'use strict';

const Config = require('../../config');
const PathMatcher = require('./pathmatcher');

const utils = {
    isPathInDefinitions: (cacheKey) => {

        let keys = Object.keys(require(Config.cache.endpoints));
        for (let i = 0; i < keys.length; i++) {
            if (PathMatcher.match(keys[i], cacheKey)) {
                return true;
            }
        }

        return false;
    },
    generateCacheResponse: (h, payload) => {
        const response = h.response(payload);
        response.headers = {
            'X-Cache' : 'HIT'
        };
        return response;
    }
};

module.exports = utils;
