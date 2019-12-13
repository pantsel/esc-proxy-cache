const Cache = require('../../../lib/cache');

module.exports = {
    method: (req, h) => {
        const id = req.params.path;
        const cached = Cache.get(id);
        console.log(cached)
        if(cached && cached.response) {
            console.log("Serving from cache", cached);
            return h.response(cached.response).takeover();
        } else if(cached) {
            // Subscribe to response
        } else {
            Cache.initId(req.params.path);
            return h.continue;
        }
    },
    assign: 'm1'
}