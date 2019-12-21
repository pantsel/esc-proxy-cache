const upstreams = process.env.PROXY_H202_UPSTREAMS.split(',');

module.exports = {
    matchHeaders: []
};

module.exports.h202 = {
    mapUri: function (request, cb) {
        return {
            uri: `${process.env.PROXY_H202_UPSTREAM_REQUEST_PROTOCOL}://${upstreams[Math.floor(Math.random() * upstreams.length)]}/${request.params.path}`
        };
    },
    xforward: process.env.PROXY_H202_XFORWARD === 'true',
    passThrough: process.env.PROXY_H202_PASSTHROUGH === 'true',
    downstreamResponseTime: process.env.PROXY_H202_DOWNSTREAM_RESPONSE_TIME === 'true',

};

module.exports.retryPolicy = {
    retries: process.env.PROXY_RETRY_POLICY_RETRIES ? parseInt(process.env.PROXY_RETRY_POLICY_RETRIES) : 0
};