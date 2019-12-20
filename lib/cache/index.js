'use strict';

const Memory = require('./strategies/memory');
const Config = require('../../config');
const cachingUtils = require('./utils');
const Logger = require('../logger');
const Events = require('../events');


class Cache {

    constructor() {
        this.strategies = {
            memory: Memory
        };
        this.utils = cachingUtils;
        this.REMOVAL_REASONS = {
            REQUEST_ERROR: 1,
            CACHE_INVALIDATION: 2,
            UPSTREAM_SERVER_ERROR: 3
        }
    }

    setStrategy(name) {
        this.strategy = this.strategies[name];
        Logger.info(`Cache Strategy set to ${name}`);
        return this;
    }

    async init() {
        await this.strategy.init();
        Logger.info(`Cache Service started`);
    }

    /**
     * Creates a new empty cache object
     * @param id
     * @param requestHeaders
     * @returns {Promise<*>}
     */
    async add(id, requestHeaders) {
        return this.strategy.add(id, requestHeaders);
    }

    async get(id) {
        let item = await this.strategy.get(id);
        if(item && Object.keys(item)) {
            this.set(id, item.response, item.ttl).catch(e => console.log(e));
        }
        return item;
    }

    async put(id, data, ttl) {
        return this.strategy.put(id, data, ttl);
    }

    async set(id, data, ttl) {
        const endpointDefinition = this.utils.getEndpointDefinitionFromEncodedUri(id);
        return this.strategy.set(id, data, ttl || endpointDefinition.ttl || Config.cache.ttl);
    }

    async remove(id) {
        if(await this.isPresentAndFulfilled(id)) {
            return await this.strategy.remove(id);
        }
    }

    async forcefullyRemove(id, reason, stackTrace) {
        Events.publish(id, {
            action: Events.PUBLISH_ACTIONS.REMOVAL,
            removalReason: reason,
            error: stackTrace
        }).catch(e => Logger.error(e));
        return await this.strategy.remove(id);
    }

    async flush() {
        return await this.strategy.flush();
    }

    async isPresentAndFulfilled(id) {
        const item = await this.get(id);
        if(!item) {
            return true;
        }
        return !!(item && item.expiration);
    }

}

module.exports = new Cache();