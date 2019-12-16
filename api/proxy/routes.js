'use strict';

const pckg = require('../../package');
const ProxyHandler = require('./handler');
const RequestMiddleware = require('./middleware/request');

const proxyRoutes = {
    name: 'proxy',
    version: pckg.version,
    register: function (server, options) {
        server.route({
            method: 'GET',
            path: '/{path*}',
            config: {
                pre: [
                    RequestMiddleware
                ],
                handler: ProxyHandler.proxy
            }

        });
    }
};

module.exports = proxyRoutes;