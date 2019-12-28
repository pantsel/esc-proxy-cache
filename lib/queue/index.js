const Bull = require('bull');
const uuidv4 = require('uuid/v4');
const Wreck = require('@hapi/wreck');
const ProxyService = require('../../api/proxy/services/proxy-service');
const Boom = require('@hapi/boom');

const Queue =  {
    init: async (name, opts) => {
        Queue.queue = new Bull(name, opts || {});
    },

    push: async (request, h) => {
        const uuid = uuidv4();
        const promise = new Promise((resolve, reject) => {
            Queue.queue.process(uuid, async (job) => {
                try {
                    const res  = await ProxyService.proxy(request, h);
                    const payload = await Wreck.read(res, {json: true });
                    if(res.statusCode >= 400) {
                        const error = Boom.badRequest(payload.message || payload);
                        error.output.statusCode = res.statusCode;
                        error.reformat();
                        return reject(error)
                    }
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
