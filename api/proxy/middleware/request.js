const Cache = require('../../../lib/cache');
const Utils = require('../../../lib/utils');
const Events = require('../../../lib/events');

const RequestMiddleware = {
  method: async (request, h) => {

    // Strip http2 request pseudo-headers

    const cacheKey = Cache.utils.requestKey(request);
    const endpointDefinition = Cache.utils.getEndpointDefinition(request.params.path);

    if(request.method.toLowerCase() !== ('get' || 'head') || !endpointDefinition) {
      return h.continue;
    }

    const cachedRequest = await Cache.get(cacheKey);

    if(!cachedRequest) {
      Cache.add(cacheKey).catch(e => console.log(e));
      return h.continue;
    }

    if(cachedRequest.response) {
      let response = Utils.generateCacheResponse(h, cachedRequest.response);
      return response.takeover();
    }

    // Subscribe to req topic
    return Events.subscribe(cacheKey)
        .then(event => {
          // SUCCESS OR FAILURE LOGIC
          if(event.errorCode) {

              if(event.errorCode >= 500) {
                  // TODO: WRITE LOGIC
              }

              if(event.errorCode === (401 || 403)) {
                  // TODO: WRITE LOGIC
              }

              // All other cases
              let response = Utils.generateCacheError(h, event.data, event.errorCode, "QUEUE");
              return response.takeover();

          }

          let response = Utils.generateCacheResponse(h, event.data, "QUEUE");
          return response.takeover();

        }).catch(e => console.error(e));
  },
  assign: 'mReq'
};

module.exports = RequestMiddleware;