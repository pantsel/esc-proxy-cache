'use strict';

const Hapi = require('@hapi/hapi');
const Config = require('../config');
const Http2 = require('http2');
const _ = require('lodash');

const listener = Http2.createSecureServer(Config.server.tls);
const options = _.merge(Config.server.options, {
    listener: listener
})

const server = Hapi.server(options);
const registerPlugins = async () => {
    await server.register(H2o2);
}
const registerRoutes = async () => {
    await server.register(require('./api/v1/routes'), {
        routes: {
            prefix: '/api/v1'
        }
    });
    await server.register(require('./api/proxy/routes'), {
        routes: {
            prefix: '/proxy'
        }
    });
}

exports.init = async () => {

    await registerPlugins();
    await registerRoutes();

    await server.initialize();
    return server;
};

exports.start = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
    return server;
};

exports.lift = async () => {
    await exports.init();
    await exports.start();
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});