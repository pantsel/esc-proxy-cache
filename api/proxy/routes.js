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
                handler: function (request, h) {

                    return h.proxy({
                        mapUri: function (request) {
                            console.log(request.params.path);
                            return {
                                uri: 'http://localhost:3001/' + request.params.path
                            };
                        },
                        passThrough: true,
                        xforward: true,
                        // protocol: process.env.ROXY_UPSTREAM_PROTOCOL || 'https',
                        downstreamResponseTime: true,
                        // secureProtocol: 'TLSv1_2_server_method',
                        onResponse: function (err, res, request, h, settings, ttl) {
                            return res;
                        }
                    });

                },
                // payload: { parse: false }
            }

        });
    }
};

module.exports = proxyRoutes;