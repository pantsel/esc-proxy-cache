'use strict';

const _ = require('lodash');
const Config = require('../../config');

const utils = {
    generateCacheResponse: (h, res, xCacheHeader) => {
        const response = h.response(res.payload);
        const defaultHeaders = Config.proxy.h202.passThrough ? res.headers : {};
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
