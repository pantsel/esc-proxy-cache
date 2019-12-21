'use strict';

const MemoryBroker = require('./strategies/memory');
const Queue = require('./strategies/queue');
const logger = require('../logger');
const Config = require('../../config');

class Events {
    constructor() {
        this.strategies = {
            'memory': new MemoryBroker(),
            'queue' : new Queue()
        };

        this.PUBLISH_ACTIONS = {
            RESPONSE: 1,
            REMOVAL: 2
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

    async publish(topic, data) {
        return await this.strategy.publish(topic, data);
    }

    async subscribe(topic) {
        return new Promise((resolve, reject) => {
            const subscriptionTimeout = setTimeout(() => {
                reject(new Error("SUBSCRIPTION_TIMEOUT"))
            }, Config.pubSub.subscriptionTimeout);

            this.strategy.subscribe(topic)
                .then(result => {
                    clearTimeout(subscriptionTimeout);
                    resolve(result);
                });
        });
    }

    async listenerCount (event) {
        return this.strategy.listenerCount(event)
    }

    async removeListener(event, fn) {
        return this.strategy.removeListener(event, fn)
    }

}

module.exports = new Events();
