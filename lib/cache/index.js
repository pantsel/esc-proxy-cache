'use strict';

const Memory = require('./strategies/memory');
const Config = require('../../config');
console.log(Config.cache.endpoints)
const endpoints = require(Config.cache.endpoints);

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

    endpointConfig(path) {
        return endpoints[path];
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