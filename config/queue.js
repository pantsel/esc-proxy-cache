module.exports = {
    strategy: process.env.QUEUE_STRATEGY || 'memory',
    name: process.env.QUEUE_NAME || 'queue'
};