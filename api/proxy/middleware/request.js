const Cache = require('../../../lib/cache');
const Utils = require('../../../lib/utils');
const Events = require('../../../lib/events');

const RequestMiddleware = {
  method: async (request, h) => {

    const cacheKey = Cache.utils.requestKey(request);
    const endpointDefinition = Cache.utils.getEndpointDefinition(cacheKey);

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
          console.log("Got data from events", data);
          let response = Utils.generateCacheResponse(h, data);
          return response.takeover();
        }).catch(e => console.error(e));
  },
  assign: 'mreq'
};

module.exports = RequestMiddleware;