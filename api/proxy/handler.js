'use strict';

const Config = require('../../config');
const _ = require('lodash');
const Wreck = require('@hapi/wreck');
const Cache = require('../../lib/cache');

module.exports = {
    proxy: (request, h) => {
        return h.proxy(_.merge(Config.proxy, {
            onResponse: function (err, res, request, h, settings, ttl) {
                if(err) { throw err; }

                Wreck.read(res, { gunzip: true, json: true })
                    .then(async payload => {
                        const cacheKey = Cache.utils.requestKey(request);
                        await Cache.set(cacheKey, payload);
                    });
                return res; 
            }
        }))
    }
};