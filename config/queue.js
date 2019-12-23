module.exports = {
    enabled: process.env.QUEUE_ENABLED === 'true',
    name: process.env.QUEUE_NAME || 'queue'
};