'use strict';

require('dotenv').config();

const Config = require('./config');
const Server = require('./lib/server');
const Cache = require('./lib/cache');
const Events = require('./lib/events');

const init = async () => {
    await Cache.setStrategy(Config.cache.strategy).init();
    await Events.setStrategy("memory").init();
    await Server.lift();
};

init();