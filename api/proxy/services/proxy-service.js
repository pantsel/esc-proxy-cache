'use strict';

const Config = require('../../../config');
const Cache = require('../../../lib/cache');
const Logger = require('../../../lib/logger');
const ErrorHandler = require('../errors');
const Events = require('../../../lib/events');
const _ = require('lodash');
const Wreck = require('@hapi/wreck');
const Boom = require('@hapi/boom');

const ProxyService = {
    proxy : (request, h) => {
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

                    Wreck.read(res, { json: true })
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
    },

    proxyRead: async (request, h) => {
        const res  = await ProxyService.proxy(request, h);
        const payload = await Wreck.read(res, {json: true });
        if(res.statusCode >= 400) {
            const error = Boom.badRequest(payload.message || payload);
            error.output.statusCode = res.statusCode;
            error.reformat();
            throw error;
        }
        return {payload, res}
    }
};

module.exports = ProxyService;
