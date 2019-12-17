'use strict';

const Memory = require('./strategies/memory');
const Config = require('../../config');
const cachingUtils = require('./utils');


class Cache {

    constructor() {
        this.strategies = {
            memory: Memory
        };
        this.utils = cachingUtils;
    }

    setStrategy(name) {
        this.strategy = this.strategies[name];
        return this;
    }

    async init() {
        return this.strategy.init();
    }


    /**
     * Creates a new empty cache object
     * @param id
     * @returns {Promise<*>}
     */
    async add(id) {
        return this.strategy.add(id);
    }

    async get(id) {
        return this.strategy.get(id);
    }

    async put(id, data, ttl) {
        return this.strategy.put(id, data, ttl);
    }

    async set(id, data, ttl) {
        const endpointDefinition = this.utils.getEndpointDefinition(id);
        return this.strategy.set(id, data, ttl || endpointDefinition.ttl || Config.cache.ttl);
    }

    async remove(id) {
        if(this.isFulfilled(id)) {
            return await this.strategy.remove(id);
        }
    }

    async flush() {
        return await this.strategy.flush();
    }

    async isFulfilled(id) {
        const item = await this.get(id);
        return item && item.expiration;
    }

}

module.exports = new Cache();