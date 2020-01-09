const Redis = require('./strategies/bull');
const Memory = require('./strategies/memory');
const Logger = require('../../lib/logger');

class Queue {

    constructor() {
        this.strategies = {
            memory: Memory,
            redis: Redis
        };
    }

    setStrategy(name) {
        this.strategy = this.strategies[name];
        Logger.info(`Queue Strategy set to ${name}`);
        return this;
    }

    getState() {
        return this.strategy.getState();
    }

    async init(name, opts) {
        return await this.strategy.init(name, opts);
    }

    async push(request, h) {
        return await this.strategy.push(request, h);
    }

    async close() {
        return await this.strategy.close();
    }
}

module.exports = new Queue();
