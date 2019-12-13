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

    init() {
        this.strategy.init();
    }

    get(id) {
        this.strategy.get(id);
    }

    getOrSet(id, data, ttl) {
        this.strategy.put(id, data, ttl);
    }

    set(id, data, ttl) {
        this.strategy.set(id, data, ttl);
    }

    initId(id) {
        this.strategy.initId(id);
    }

    remove(id) {
        this.strategy.remove(id);
    }

}

module.exports = new Cache();