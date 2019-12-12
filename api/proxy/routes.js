'use strict';

const pckg = require('../../package');
const ProxyService = require('./proxy-service')

const proxyRoutes = {
    name: 'proxy',
    version: pckg.version,
    register: function (server, options) {
        server.route({
            method: 'GET',
            path: '/{path*}',
            config: {
                handler: function (request, h) {
                    return ProxyService.proxy(request, h);
                }
            }
        });
    }
};

module.exports = proxyRoutes;