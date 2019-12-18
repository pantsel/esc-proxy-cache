'use strict';

const Config = require('../../config');
const _ = require('lodash');
const Wreck = require('@hapi/wreck');
const Cache = require('../../lib/cache');
const Events = require('../../lib/events');
const Logger = require('../../lib/logger');

module.exports = {
    proxy: (request, h) => {
        return h.proxy(_.merge(Config.proxy, {
            onResponse: async function (err, res, request, h, settings, ttl) {
                if(err) {
                    Logger.error("Error on proxy response: ", err);
                    throw err;
                }

                const cacheKey = Cache.utils.requestKey(request);
                const endpointDefinition = Cache.utils.getEndpointDefinition(request.params.path);

                if(!endpointDefinition || request.method.toLowerCase() === 'options') {
                    return res;
                }

                // TODO: Decide how to handle upstream server error codes
                if(res.statusCode < 400) {
                    // Proposition:
                    // In case of a get || head and if the cache contains an unfulfilled item for this url, delete it.
                    // Then publish a deletion event with the error response as a `reason`,
                    // in order to handle stale listeners.
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