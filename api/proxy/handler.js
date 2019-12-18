'use strict';

const Config = require('../../config');
const _ = require('lodash');
const Wreck = require('@hapi/wreck');
const Cache = require('../../lib/cache');
const Events = require('../../lib/events');

module.exports = {
    proxy: (request, h) => {
        return h.proxy(_.merge(Config.proxy, {
            onResponse: async function (err, res, request, h, settings, ttl) {
                if(err) { throw err; }

                const cacheKey = Cache.utils.requestKey(request);
                const endpointDefinition = Cache.utils.getEndpointDefinition(cacheKey);

                if(!endpointDefinition || request.method.toLowerCase() === 'options') {
                    return res;
                }

                if(request.method.toLowerCase() === ('get' || 'head')) {
                    Wreck.read(res, { gunzip: true, json: true })
                        .then(async payload => {
                            const cacheKey = Cache.utils.requestKey(request);
                            await Cache.set(cacheKey, payload);
                            Events.publish(cacheKey, payload).catch(e => console.error(e));
                        });
                    return res;
                }
                await Cache.remove(cacheKey);
                return res; 
            }
        }))
    }
};