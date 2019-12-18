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

process.on('uncaughtException', (err, origin) => {
    logger.error("uncaughtException at:",origin, 'error', err);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});