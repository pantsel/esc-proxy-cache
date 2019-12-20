const Events = require('../../lib/events');
const Logger = require('../../lib/logger');
const Cache = require('../../lib/cache');
const Wreck = require('@hapi/wreck');
const Https = require('https');
const Config = require('../../config');
const fs = require('fs');

const Errors = {
    handle: async (err, res, request, h, settings, ttl, cacheKey) => {
        if(!res) { // I no response is available, its a connection refused or timeout error
            let currentTry = parseInt(request.headers['x-try']);
            const retries = Config.proxy.retryPolicy.retries;
            if(currentTry  < retries) {
                request.headers['x-try'] = currentTry + 1;
                Logger.info(`Retrying ${request.method} ${request.url.href} retry: ${request.headers['x-try']}`);
                try {
                    return await Wreck.request(request.method, request.url.href, {
                        headers: request.headers,
                        // agents : {
                        //     https: new Https.Agent({
                        //         key: Config.server.tls.key,
                        //         cert: Config.server.tls.cert
                        //     }),
                        // }
                    });
                }
                catch (error) {
                    Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.UPSTREAM_CONNECTION_REFUSED_OR_TIMEOUT, error).catch(e => Logger.error(e));
                    throw error;
                }
            }

        }
        Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.REQUEST_ERROR, res).catch(e => Logger.error(e));
        return res;
    },
};

module.exports = Errors;