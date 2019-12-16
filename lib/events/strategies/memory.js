'use strict';

const EventEmitter = require('events');

class MemoryBroker {

    async init() {
        return this.emitter = new EventEmitter();
    }

    async publish(topic, data) {
        return this.emitter.emit(topic, data);
    }

    subscribe(topic) {
        return new Promise(resolve => {
            this.emitter.on(topic, (data) => {
                resolve(data);
            });
        })
    }

}

module.exports = MemoryBroker;