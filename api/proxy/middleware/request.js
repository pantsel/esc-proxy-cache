const Cache = require('../../../lib/cache');
const Config = require('../../../config');

const RequestMiddleware = {
  method: async (request, h) => {

    const path = request.params.path;
    const cacheKey = `/${path}`;
    const shouldBeHandled = Config.cache.endpoints[cacheKey];

    if(request.method.toLowerCase() !== ('get' || 'head') || !shouldBeHandled) {
      return h.continue;
    }

    const cachedRequest = await Cache.get(cacheKey);

    if(!cachedRequest) {
      Cache.add(cacheKey).catch(e => console.log(e));
      return h.continue;
    }

    if(cachedRequest.response) {
      return h.response(cachedRequest.response).takeover();
    }

    // Subscribe to req topic
  },
  assign: 'mreq'
};

module.exports = RequestMiddleware;