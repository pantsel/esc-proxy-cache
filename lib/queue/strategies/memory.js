const states = require('../states');
const ProxyService = require('../../../api/proxy/services/proxy-service');
const async = require('async');
const Logger = require('../../../lib/logger');

class MemQueue {

    constructor() {
        this.state = '';
        this.queue = null;
    }

    async init() {
        this.queue = async.queue(async function (job) {
            try {
                const {payload, res} = await ProxyService.proxyRead(job.request, job.h);
                return {payload, headers: res.headers};
            } catch (e) {
                throw e;
            }
        }, 1);

        this.queue.error(function (err, task) {
            Logger.error('Queue:Memory:Task experienced an error', err);
        });

        this.state = states.QUEUE_STATE_READY;
        return this.queue;
    }

    async push(request, h) {
        return new Promise((resolve, reject) => {
            this.queue.push({request, h}, function (err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
        });
    }

    getState() {
        return this.state;
    }

    async close() {
        await this.queue.kill();
        this.state = states.QUEUE_STATE_CLOSED;
        return true;
    }
}

module.exports = new MemQueue();