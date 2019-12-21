const Bull = require('bull');

class Queue {

    constructor() {
        this.queues = {};
    }

    async init() {

    }

    async publish(topic, data) {
        return this.queues[topic].add(data);
    }

    subscribe(topic) {
        this.queues[topic] = new Bull(topic);

        return new Promise(resolve => {
            this.queues[topic].process(async (job) => {
                return resolve(job.data);
            })
        })
    }

}

module.exports = Queue;