'use strict';

const MemoryBroker = require('./strategies/memory');
const logger = require('../logger');

class Events {
    constructor() {
        this.strategies = {
            'memory' : new MemoryBroker()
        }
    }

    setStrategy(strategy) {
        this.strategy = this.strategies[strategy];
        logger.info(`Events strategy set to ${strategy}`);
        return this;
    }

    async init() {
        await this.strategy.init();
        logger.info(`Events service started`);
    }

    async publish(topic, data, errorCode) {

        return await this.strategy.publish(topic, {data, errorCode});
    }

    async subscribe(topic) {
        return this.strategy.subscribe(topic);
    }

}

module.exports = new Events();
