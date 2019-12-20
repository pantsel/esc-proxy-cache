module.exports = {
    strategy: process.env.PUBSUB_STRATEGY || 'memory',
    subscriptionTimeout: parseInt(process.env.SUBSCRIPTION_TIMEOUT) || 30000
};