'use strict';

const Config = require('../../config');

module.exports = {
    proxy: (request, h) => {
        return h.proxy(_.merge(Config.proxy, {
            onResponse: function (err, res, request, h, settings, ttl) {
                return res;
            }
        }))
    }
}