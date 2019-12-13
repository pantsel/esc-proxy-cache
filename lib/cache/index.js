'use strict';

const Memory = require('./strategies/memory');

class Cache {

    constructor() {
        this.strategies = {
            memory: Memory
        }
    }

    setStrategy(name) {
        this.strategy = this.strategies[name];
        return this;
    }

    async init() {
        return this.strategy.init();
    }

    async get(id) {
        return this.strategy.get(id);
    }

    async getOrSet(id, data, ttl) {
        return this.strategy.put(id, data, ttl);
    }

    async set(id, data, ttl) {
        return this.strategy.set(id, data, ttl);
    }

    async remove(id) {
        return this.strategy.remove(id);
    }

}

module.exports = new Cache();