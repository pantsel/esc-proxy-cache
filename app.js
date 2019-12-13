'use strict';

require('dotenv').config()

const Server = require('./lib/server');
const Cache = require('./lib/cache');

const init = async () => {

    await Cache.setStrategy('memory').init();
    await Server.lift();
};

init();