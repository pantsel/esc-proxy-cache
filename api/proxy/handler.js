'use strict';

const Config = require('../../config');
const _ = require('lodash');
const Wreck = require('@hapi/wreck');
const Cache = require('../../lib/cache');
const Events = require('../../lib/events');
const Logger = require('../../lib/logger');
const ErrorHandler = require('./errors');

module.exports = {
    proxy: (request, h) => {
        return h.proxy(_.merge(Config.proxy.h202, {
            onResponse: async function (err, res, request, h, settings, ttl) {

                const cacheKey = Cache.utils.requestKey(request);
                const endpointDefinition = Cache.utils.getEndpointDefinition(request.params.path);

                if(err) {
                    Logger.error("Error on upstream connection: ", err);
                    return ErrorHandler.handle(err, res, request, h, settings, ttl, cacheKey);
                }

                if(!endpointDefinition || request.method.toLowerCase() === 'options') {
                    return res;
                }

                if(request.method.toLowerCase() === ('get' || 'head')) {

                    if(res.statusCode > 399) {
                        return ErrorHandler.handle(err, res, request, h, settings, ttl, cacheKey);
                    }

                    Wreck.read(res, { gunzip: true, json: true })
                        .then(async payload => {
                            await Cache.set(cacheKey, {payload, headers: res.headers});
                            Events.publish(cacheKey, {
                                action: Events.PUBLISH_ACTIONS.RESPONSE,
                                payload: payload,
                                headers: res.headers
                            }).catch(e => console.error(e));
                        });
                    return res;
                }

                // In case of any other request method,
                // Only remove item from cache on a successful response
                if(res.statusCode < 400) {
                    Cache.remove(cacheKey).catch(e => console.error(e));
                }

                return res; 
            }
        }))
    }
};