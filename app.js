'use strict';

require('dotenv').config()

const Server = require('./lib/server');
const Cache = require('./lib/cache');

const init = async () => {

    await Cache.setStrategy('memory').init();
    await Server.lift();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();