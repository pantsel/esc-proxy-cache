module.exports = {
    strategy: process.env.PUBSUB_STRATEGY || 'memory',
    subscriptionTimeout: parseInt(process.env.PUBSUB_SUBSCRIPTION_TIMEOUT) || 30000
};
