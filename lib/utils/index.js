'use strict';

const _ = require('lodash');
const Config = require('../../config');

const utils = {
    generateCacheResponse: (h, res, xCacheHeader) => {
        const response = h.response(res.payload);
        // When using gunzip, HTTP headers Content-Encoding, Content-Length, Content-Range and ETag
        // won't reflect the reality as the payload has been uncompressed.
        // For that reason, they need to be omitted
        const omitHeaders = ['content-length', 'etag', 'content-encoding', 'content-range'];
        const defaultHeaders = _.omit(Config.proxy.h202.passThrough ? res.headers : {}, omitHeaders);
        response.headers = _.merge(defaultHeaders, {
            'X-Cache' : xCacheHeader || 'HIT'
        });
        return response;
    },

    generateCacheError: (h, payload, statusCode, xCacheHeader) => {
        const response = h.response(payload);
        response.headers = {
            'X-Cache' : xCacheHeader || 'HIT'
        };
        return response.code(statusCode);
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
