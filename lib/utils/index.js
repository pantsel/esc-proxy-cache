'use strict';

const utils = {
    generateCacheResponse: (h, payload, xCacheHeader) => {
        const response = h.response(payload);
        response.headers = {
            'X-Cache' : xCacheHeader || 'HIT'
        };
        return response;
    },
    sleep: async(timeout) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true);
            }, timeout);
        })
    }
};

module.exports = utils;
