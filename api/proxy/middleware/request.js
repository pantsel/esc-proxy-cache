const Cache = require('../../../lib/cache');
const Utils = require('../../../lib/utils');
const Events = require('../../../lib/events');
const Boom = require('@hapi/boom');
const Logger = require('../../../lib/logger');
const Config = require('../../../config');

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

        if(request.headers['x-try'] && request.headers['x-try']  > 1) {
            return h.continue;
        }

        // Subscribe to req topic
        return Events.subscribe(cacheKey)
            .then(event => {
                if (event.action === Events.PUBLISH_ACTIONS.REMOVAL) {

                    if (event.removalReason === Cache.REMOVAL_REASONS.REQUEST_ERROR) {
                        return Utils.generateCacheError(h, event.error.output.payload, event.error.output.statusCode, 'QUEUE')
                            .takeover()
                    }

                    if (event.removalReason === Cache.REMOVAL_REASONS.CACHE_INVALIDATION) {
                        return h.continue; // Forward the request upstream
                    }

                    if (event.removalReason === Cache.REMOVAL_REASONS.UPSTREAM_SERVER_ERROR) {
                        // TODO: Decide upon the following
                        // Either forward the requests to the upstream server or
                        // respond with the error the original caller received
                        return Utils.generateCacheError(h, event.error.output.payload, event.error.output.statusCode, 'QUEUE')
                            .takeover()
                    }

                    // In any other case forward the requests to the upstream server
                    return h.continue;

                }

                let response = Utils.generateCacheResponse(h, event, "QUEUE");
                return response.takeover();
            }).catch(e => {
                Logger.error('Event subscription error', e);
                return Boom.expectationFailed(e.message);
            });
    },
    assign: 'mReq'
};

module.exports = RequestMiddleware;