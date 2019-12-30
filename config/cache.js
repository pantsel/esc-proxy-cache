module.exports = {
    strategy: process.env.CACHE_STRATEGY || 'memory',
    endpoints: process.env.CACHE_ENDPOINTS_JSON_FILE_PATH || process.cwd() + '/test/upstream-server/cacheable-endpoints.json',
    ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : 30000,
    rollingTTL: process.env.CACHE_ROLLING_TTL === 'true'
};
