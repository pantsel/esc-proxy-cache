const Logger = require('../../lib/logger');
const Cache = require('../../lib/cache');
const Wreck = require('@hapi/wreck');
const Config = require('../../config');

const Errors = {
    isServerError: (res) => {
        return !res || res.statusCode >= 500
    },
    
    isAuthenticationError: (res) => {
      return res && res.statusCode === (401 || 403)
    },

    handleServerError: async (err, res, request, h, settings, ttl, cacheKey) => {
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
                Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.UPSTREAM_SERVER_ERROR, error).catch(e => Logger.error(e));
                throw error;
            }
        }

        Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.UPSTREAM_SERVER_ERROR, res || err).catch(e => Logger.error(e));

        if(res) return res;
        throw err;

    },

    handle: async (err, res, request, h, settings, ttl, cacheKey) => {
        if(Errors.isServerError(res)) {
            return Errors.handleServerError(err, res, request, h, settings, ttl, cacheKey);
        }

        if(Errors.isAuthenticationError(res)) {
            // ToDo: Handle auth errors
        }

        Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.REQUEST_ERROR, res).catch(e => Logger.error(e));
        return res;
    },
};

module.exports = Errors;