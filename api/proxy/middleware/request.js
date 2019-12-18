const Cache = require('../../../lib/cache');
const Utils = require('../../../lib/utils');
const Events = require('../../../lib/events');

const RequestMiddleware = {
  method: async (request, h) => {

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
        .then(data => {
          let response = Utils.generateCacheResponse(h, data, "QUEUE");
          return response.takeover();
        }).catch(e => console.error(e));
  },
  assign: 'mReq'
};

module.exports = RequestMiddleware;