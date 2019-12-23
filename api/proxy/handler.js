'use strict';
const ProxyService = require('./services/proxy-service');

module.exports = {
    proxy: (request, h) => {
        return ProxyService.proxy(request, h);
    }
};