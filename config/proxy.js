module.exports = {
    mapUri: function (request) {
        return {
            uri: (process.env.PROXY_UPSTREAM_URI || 'http://localhost:3001') + request.params.path
        };
    },
    xforward: process.env.PROXY_XFORWARD === 'true',
    downstreamResponseTime: process.env.PROXY_XFORWARD === 'true',
}