module.exports = {
    strategy: process.env.QUEUE_STRATEGY || 'memory',
    enabled: process.env.QUEUE_ENABLED === 'true',
    name: process.env.QUEUE_NAME || 'queue'
};