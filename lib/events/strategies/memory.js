'use strict';

const EventEmitter = require('events');

class MemoryBroker {

    async init() {
        return this.emitter = new EventEmitter();
    }

    async removeListener(event, fn) {
        return this.emitter.removeListener(event, fn)
    }

    async listenerCount (event) {
        return this.emitter.listenerCount(event)
    }

    async publish(topic, data) {
        return this.emitter.emit(topic, data);
    }

    subscribe(topic) {
        return new Promise(resolve => {
            this.emitter.once(topic, (data) => {
                resolve(data);
            });
        })
    }

}

module.exports = MemoryBroker;