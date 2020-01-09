const Bull = require('bull');
const uuidv4 = require('uuid/v4');
const ProxyService = require('../../../api/proxy/services/proxy-service');
const Logger = require('../../../lib/logger');

const Queue =  {

    state: '',

    init: async (name, opts) => {

        return new Promise((resolve) => {
            Queue.queue = new Bull(name, opts || {});
            Queue.queue.clients[0].on('ready', function() {
                Logger.info('Queue: Redis connection is ready');
                Queue.state = 'ready';
                resolve(Queue.queue);
            });

            Queue.queue.clients[0].on('error', function(error) {
                Logger.error('Queue: Redis connection error', error);
                Queue.state = 'error';
            })
        })
    },

    getState: () => {
        return Queue.state;
    },

    close: async () => {
        Queue.state = 'closed';
        await Queue.queue.close();
        return true;
    },

    push: async (request, h) => {
        const uuid = uuidv4();
        const promise = new Promise((resolve, reject) => {
            Queue.queue.process(uuid, async (job) => {
                try {
                    const {payload, res} = await ProxyService.proxyRead(request, h);
                    return resolve({payload, headers: res.headers});
                }catch (e) {
                    reject(e);
                }
            });
        });

        Queue.queue.add(uuid, {
            method: request.method,
            url: request.url.href,
            headers: request.headers
        });

        return promise.then(result => {
            return result;
        }).catch(e => {
            throw e;
        })
    }
};

module.exports = Queue;
