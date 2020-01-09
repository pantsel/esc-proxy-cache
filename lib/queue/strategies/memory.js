const states = require('../states');
const ProxyService = require('../../../api/proxy/services/proxy-service');
const async = require('async');

const MemQueue =  {

    state: '',

    init: async (name, opts) => {
        this.queue = async.queue(async function(job) {
            try {
                const {payload, res} = await ProxyService.proxyRead(job.request, job.h);
                return  {payload, headers: res.headers};
            }catch (e) {
                throw e;
            }
        }, 1);
        this.state = states.QUEUE_STATE_READY;
        return this.queue;

    },

    push: async (request, h) => {
        return new Promise((resolve, reject) => {
            this.queue.push({request, h}, function(err, result) {
                if(err) return reject(err);
                return resolve(result);
            });
        });
    },

    getState: () => {
        return this.state;
    },

    close: async () => {
        this.state = states.QUEUE_STATE_CLOSED;
        return true;
    }
};

module.exports = MemQueue;