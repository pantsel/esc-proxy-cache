'use strict';

const pckg = require('../../package');

const plugin = {
    name: 'api',
    version: pckg.version,
    register: function (server, options) {
        server.route({
            method: 'GET',
            path: '/info',
            handler: function (request, h) {
                return {
                    request_headers: request.headers,
                    version: plugin.version,
                    date: new Date()
                };
            }
        });
    }
};

module.exports = plugin;