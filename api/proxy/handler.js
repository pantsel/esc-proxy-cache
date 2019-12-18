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
                const endpointDefinition = Cache.utils.getEndpointDefinition(request.params.path);

                if(!endpointDefinition || request.method.toLowerCase() === 'options' || res.statusCode > 399) {
                    return res;
                }

                if(request.method.toLowerCase() === ('get' || 'head')) {
                    Wreck.read(res, { gunzip: true, json: true })
                        .then(async payload => {
                            await Cache.set(cacheKey, payload);
                            Events.publish(cacheKey, payload).catch(e => console.error(e));
                        });
                    return res;
                }

                Cache.remove(cacheKey).catch(e => console.error(e));

                return res; 
            }
        }))
    }
};