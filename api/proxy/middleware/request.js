const Cache = require('../../../lib/cache');
const Utils = require('../../../lib/utils');
const Events = require('../../../lib/events');
const Boom = require('@hapi/boom');
const Logger = require('../../../lib/logger');
const Queue = require('../../../lib/queue');
const Config = require('../../../config');

function pushToQueue(request, h) {
    return Queue.push(request, h)
        .then(result => {
            return Utils.generateCacheResponse(h, result, "QUEUE")
                .takeover();
        }).catch(e => {
            return Utils.generateCacheError(h, e.output.payload, e.output.statusCode, 'QUEUE')
                .takeover();
        });
}

function forwardUpstream(request, h) {
    return Config.queue.enabled && Queue.getState() === 'ready' ? pushToQueue(request, h) : h.continue;
}

const RequestMiddleware = {
    method: async (request, h) => {

        const cacheKey = Cache.utils.requestKey(request);

        if (!Cache.utils.shouldBeHandled(request)) {
            return h.continue;
        }

        const cachedRequest = await Cache.get(cacheKey);

        if (!cachedRequest) {
            Cache.add(cacheKey).catch(e => console.log(e));
            return h.continue;
        }

        if (cachedRequest.response) {
            let response = Utils.generateCacheResponse(h, cachedRequest.response);
            return response.takeover();
        }

        // Don't go through subscription phase if the request is retrying
        if(request.headers['x-try'] && request.headers['x-try']  > 1) {
            return h.continue;
        }

        // Subscribe to req topic
        return Events.subscribe(cacheKey)
            .then(async event => {
                if (event.action === Events.PUBLISH_ACTIONS.REMOVAL) {

                    if (event.removalReason === Cache.REMOVAL_REASONS.REQUEST_ERROR
                        || event.removalReason === Cache.REMOVAL_REASONS.UPSTREAM_SERVER_ERROR) {
                        return Utils.generateCacheError(h, event.error.output.payload, event.error.output.statusCode, 'QUEUE')
                            .takeover()
                    }

                    // In any other case forward the requests to the upstream server
                    return forwardUpstream(request, h);
                }

                let response = Utils.generateCacheResponse(h, event, "PUB");
                return response.takeover();
            }).catch(e => {
                Logger.error('Event subscription error', e);
                return Boom.expectationFailed(e.message);
            });
    },
    assign: 'mReq'
};

module.exports = RequestMiddleware;
