'use strict';

const MemoryBroker = require('./strategies/memory');

class Events {
    constructor() {
        this.strategies = {
            'memory' : new MemoryBroker()
        }
    }

    setStrategy(strategy) {
        this.strategy = this.strategies[strategy];
        return this;
    }

    async init() {
        return await this.strategy.init();
    }

    async publish(topic, data) {
        return await this.strategy.publish(topic, data);
    }

    async subscribe(topic) {
        return this.strategy.subscribe(topic);
    }

}

module.exports = new Events();
