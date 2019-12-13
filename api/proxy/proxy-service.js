const Config = require('../../config');
const _ = require('lodash');
const Cache = require('../../lib/cache');
const Wreck = require('@hapi/wreck')

const ProxyService = {

    proxy: (req, h) => {

        return h.proxy(_.merge(Config.proxy, {
            onRequest: ProxyService.onRequest,
            onResponse: ProxyService.onResponse
        }))
    },
    onResponse: (err, res, request, h, settings, ttl) => {
        if(res.statusCode >= 200 && res.statusCode <= 399) {
            const id = request.params.path;
            Wreck.read(res, { gunzip: true, json: true })
                .then(payload => {
                    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", payload)
                    // Publish response before caching it in order to mitigate latency
                    // PubSub.publish(cacheKey, JSON.stringify(payload))
                    Cache.set(id, payload);
                })
        }
        return res;
    }
}

module.exports = ProxyService;