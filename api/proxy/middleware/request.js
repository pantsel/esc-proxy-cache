const Cache = require('../../../lib/cache');

const RequestMiddleware = {
  method: async (request, h) => {
    const endpoint = request.params.path;
    const endpointConfig = Cache.endpointConfig(endpoint);

    if(!endpointConfig || request.method.toLowerCase() !== 'get') {
      return h.continue;
    }

    const cachedRequest = await Cache.get(endpoint);
    if(!cachedRequest) {
      Cache.set(endpoint, {}, endpointConfig.ttl).catch(e => console.error(e));
      return h.continue;
    }

    if(cachedRequest.response) {
      return h.response(cachedRequest.response).takeover();
    }

    //Subscribe to topic (return promise)

  },
  assign: 'mreq'
};

module.exports = RequestMiddleware;