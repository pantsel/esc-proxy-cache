const Bull = require('bull');
const uuidv4 = require('uuid/v4');
const Wreck = require('@hapi/wreck');

const Queue =  {
    init: async (name, opts) => {
        Queue.queue = new Bull(name, opts || {});
    },

    push: async (request) => {
        const uuid = uuidv4();
        const promise = new Promise((resolve, reject) => {
            Queue.queue.process(uuid, async (job) => {
                try {
                    const { res, payload } = await Wreck.get(job.data.url, {
                        headers: job.data.headers,
                        json: true
                    });
                    resolve({payload, headers: res.headers});
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