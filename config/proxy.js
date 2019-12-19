const _ = require('lodash');

module.exports = {
    mapUri: function (request, cb) {

        // Strip out http2 pseudo-headers before proxying to upstream
        request.headers = _.pickBy(request.headers, function(value, key) {
            return !_.startsWith(key, ":");
        });

        return {
            uri: (process.env.PROXY_UPSTREAM_URI || 'http://localhost:3001') + request.params.path
        };
    },
    xforward: process.env.PROXY_XFORWARD === 'true',
    passThrough: process.env.PROXY_PASSTHROUGH === 'true',
    downstreamResponseTime: process.env.PROXY_DOWNSTREAM_RESPONSE_TIME === 'true'
};