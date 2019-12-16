'use strict';

const utils = {
    generateCacheResponse: (h, payload) => {
        const response = h.response(payload);
        response.headers = {
            'X-Cache' : 'HIT'
        };
        return response;
    }
};

module.exports = utils;
