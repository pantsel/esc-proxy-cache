'use strict';

const pckg = require('../../package');

const proxyRoutes = {
    name: 'proxy',
    version: pckg.version,
    register: function (server, options) {
        server.route({
            method: 'GET',
            path: '/{path*}',
            config: {
                handler: require('./handler')
            }

        });
    }
};

module.exports = proxyRoutes;