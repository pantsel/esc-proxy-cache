const Cache = require('../../../lib/cache');
const Utils = require('../../../lib/utils');
const Events = require('../../../lib/events');
// const logger = require('../../../lib/logger');
// const Logger = new logger('api.proxy.middleware.request');

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
      // Logger.log().info(`[CACHE HIT]: ${request.method.toUpperCase()} ${request.url} => %j`,  cachedRequest.response);
      return response.takeover();
    }

    // Subscribe to req topic
    return Events.subscribe(cacheKey)
        .then(data => {
          let response = Utils.generateCacheResponse(h, data, "QUEUE");
          // Logger.log().info(`[CACHE QUEUE]: ${request.method.toUpperCase()} ${request.url} => %j`,  data);
          return response.takeover();
        }).catch(e => console.error(e));
  },
  assign: 'mReq'
};

module.exports = RequestMiddleware;