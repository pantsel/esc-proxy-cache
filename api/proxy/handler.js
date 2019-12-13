const Config = require('../../config');

module.exports = (request, h) => {
    return  h.proxy(_.merge(Config.proxy, {
        onResponse: function (err, res, request, h, settings, ttl) {
            return res;
        }
    }))
}