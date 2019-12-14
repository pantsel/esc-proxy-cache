module.exports = {
    strategy: process.env.CACHE_STRATEGY || 'memory',
    endpoints: process.env.CACHE_ENDPOINTS_JSON_FILE_PATH || process.cwd() + '/test/upstream-server/cacheable-endpoints.json'
};