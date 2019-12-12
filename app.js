'use strict';

const Hapi = require('@hapi/hapi');
const Http2 = require('http2');
const _ = require('lodash');

const Config = require('./config');


const init = async () => {

    const listener = Http2.createSecureServer(Config.server.tls);
    const options = _.merge(Config.server.options, {
        listener: listener
    })

    const server = Hapi.server(options);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();