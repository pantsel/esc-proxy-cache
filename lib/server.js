'use strict';

const Hapi = require('@hapi/hapi');
const H2o2 = require('@hapi/h2o2');
const Http2 = require('http2');
const Config = require('../config');
const _ = require('lodash');
const logger = require('../lib/logger');

let server;
let options = Config.server.options;

if(Config.server.options.tls) {
    const listener = Http2.createSecureServer(Config.server.tls);
    options = _.merge(options, { listener });
}

server = Hapi.server(options);

async function registerPlugins() {
    await server.register([H2o2],{
        once: true
    });
}

async function registerRoutes() {

    await server.register(require('../api/v1/routes'), {
        routes: {
            prefix: '/api/v1'
        },
        once: true
    });
    await server.register(require('../api/proxy/routes'), {
        routes: {
            prefix: '/proxy'
        },
        once: true
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
    logger.info(`Server running at: ${server.info.uri}`);
    return server;
};

exports.lift = async () => {
    await exports.init();
    await exports.start();
};