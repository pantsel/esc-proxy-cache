const Cache = require('../../../lib/cache');
const Utils = require('../../../lib/utils');


const RequestMiddleware = {
  method: async (request, h) => {

    const path = request.params.path;
    const cacheKey = `/${path}`;

    const shouldBeHandled = Utils.isPathInDefinitions(cacheKey);

    if(request.method.toLowerCase() !== ('get' || 'head') || !shouldBeHandled) {
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
  },
  assign: 'mreq'
};

module.exports = RequestMiddleware;