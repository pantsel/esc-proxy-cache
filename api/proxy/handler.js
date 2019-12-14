'use strict';

const Config = require('../../config');
const _ = require('lodash');

module.exports = {
    proxy: (request, h) => {
        return h.proxy(_.merge(Config.proxy, {
            onResponse: function (err, res, request, h, settings, ttl) {
                if(err) { throw err; }
                return res; 
            }
        }))
    }
};