'use strict';

require('dotenv').config();

const Config = require('./config');
const Server = require('./lib/server');
const Cache = require('./lib/cache');

const init = async () => {
    await Cache.setStrategy(Config.cache.strategy).init();
    await Server.lift();
};

init();