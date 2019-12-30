'use strict';

require('dotenv').config();

const Config = require('./config');
const Server = require('./lib/server');
const Cache = require('./lib/cache');
const Events = require('./lib/events');
const Logger = require('./lib/logger');
const Queue = require('./lib/queue');

if(process.env !== 'production') process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const init = async () => {
    await Cache.setStrategy(Config.cache.strategy).init();
    await Events.setStrategy(Config.pubSub.strategy).init();
    if(Config.queue.enabled) await Queue.init(Config.queue.name, {});
    await Server.lift();
};

init();

process.on('uncaughtException', (err, origin) => {
    Logger.error("uncaughtException", err);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', reason);
    process.exit(1);
});
