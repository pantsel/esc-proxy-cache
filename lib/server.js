'use strict';

const Hapi = require('@hapi/hapi');
const H2o2 = require('@hapi/h2o2');
const Config = require('../config');
const Http2 = require('http2');
const _ = require('lodash');

let server;
let options = Config.server.options;

if(Config.server.options.tls) {
    const listener = Http2.createSecureServer(Config.server.tls);
    options = _.merge(options, { listener: listener });
}

server = Hapi.server(options);

async function registerPlugins() {
    await server.register(H2o2);
}

async function registerRoutes() {
    await server.register(require('../api/v1/routes'), {
        routes: {
            prefix: '/api/v1'
        }
    });
    await server.register(require('../api/proxy/routes'), {
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