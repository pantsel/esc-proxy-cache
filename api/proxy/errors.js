const Events = require('../../lib/events');
const Logger = require('../../lib/logger');

const Errors = {
    handle: (err, res, request, h, settings, ttl, cacheKey) => {
        Events.publish(cacheKey, res.payload, res.statusCode).catch(e => Logger.error(e));
        return res;

    },
};

module.exports = Errors;