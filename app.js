'use strict';

require('dotenv').config()

const Hapi = require('@hapi/hapi');
const Http2 = require('http2');
const _ = require('lodash');
const Config = require('./config');
const H2o2 = require('@hapi/h2o2');
const Cache = require('./lib/cache');

const init = async () => {

    Cache.setStrategy('memory').init();

    const server = Hapi.server(_.omit(Config.server.options, ['tls']));

    // const listener = Http2.createSecureServer(Config.server.tls);
    // const options = _.merge(Config.server.options, {
    //     listener: listener
    // })

    // const server = Hapi.server(options);

    await server.register(H2o2);

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


    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();