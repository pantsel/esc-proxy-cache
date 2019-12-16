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

                console.log(`Caching response: `, request.params.path);
                Wreck.read(res, { gunzip: true, json: true })
                    .then(async payload => {
                        await Cache.set(`/${request.params.path}`, payload, 3000);
                        console.log(Cache.strategy.cache);
                    });
                return res; 
            }
        }))
    }
};