const Config = require('../../config');
const _ = require('lodash');

const ProxyService = {

    proxy: (req, h) => {
        return h.proxy(_.merge(Config.proxy, {
            onRequest: ProxyService.onRequest,
            onResponse: ProxyService.onResponse
        }))
    },

    onRequest: (req) => {
        return req;
    },

    onResponse: (err, res, request, h, settings, ttl) => {
        return res;
    }
}

module.exports = ProxyService;