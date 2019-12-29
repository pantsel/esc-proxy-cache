const Logger = require('../../lib/logger');
const Cache = require('../../lib/cache');
const Wreck = require('@hapi/wreck');
const Config = require('../../config');
const Utils = require('../../lib/utils');
const Boom = require('@hapi/boom');

const Errors = {
    isServerError: (res) => {
        return !res || res.statusCode >= 500
    },
    
    isAuthenticationError: (res) => {
      return res && res.statusCode === (401 || 403)
    },

    handleServerError: async (err, res, request, h, settings, ttl, cacheKey) => {
        let currentTry = parseInt(request.headers['x-try']);
        const retries = Config.proxy.retryPolicy.retries || 1;
        if(currentTry  < retries) {
            request.headers['x-try'] = currentTry + 1;
            const ProxyService = require('./services/proxy-service');
            Logger.info(`Retrying ${request.method} ${request.url.pathname} retry: ${request.headers['x-try']}`);
            try {
                const {payload, res} = await ProxyService.proxyRead(request, h)
                return Utils.generateResponse(h, {payload, headers: res.headers}, {
                    'x-try': request.headers['x-try']
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
            Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.AUTH_ERROR, res).catch(e => Logger.error(e));
            return res;
        }

        Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.REQUEST_ERROR, res).catch(e => Logger.error(e));
        return res;
    },
};

module.exports = Errors;
