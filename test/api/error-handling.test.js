'use strict';

const Boom = require('@hapi/boom');

module.exports = (Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils) => {

    describe('Error Handling', () => {

        let server;
        let upstreamServer;

        describe('General cases', async () => {

            before(async () => {
                await Cache.setStrategy('memory').init();
                await Events.setStrategy('memory').init();
                upstreamServer = await jsonServer.start(3001);
                server = await init();
            });

            after(async () => {
                await Cache.flush();
                await server.stop();
                upstreamServer.close();
            });

            it('Responds with 504 on a 504 upstream error', async () => {

                const endpoint = '/proxy/error504';

                const res = await server.inject({
                    method: 'get',
                    url: endpoint
                });

                expect(res.statusCode).to.equal(504);
            });
        });

        describe('Upstream server down or unresponsive',  {timeout: 15000}, () => {

            before(async () => {
                await Cache.setStrategy('memory').init();
                await Events.setStrategy('memory').init();
                server = await init();
            });

            after(async () => {
                await Cache.flush();
                await server.stop();

            });

            it('It responds with 502 if the upstream server is down', async () => {

                const endpoint = '/proxy/posts/2';

                const res = await server.inject({
                    method: 'get',
                    url: endpoint
                });

                expect(res.statusCode).to.equal(502);
            });
        });

        describe('Cases that need a delayed upstream response in place', {timeout: 10000}, async () => {

            before(async () => {
                await Cache.setStrategy('memory').init();
                await Events.setStrategy('memory').init();
                upstreamServer = await jsonServer.start(3001, 3000);
                server = await init();
            });

            after(async () => {
                await Cache.flush();
                await server.stop();
                upstreamServer.close();
            });

            it('Removes cache item and notifies listeners of removal in case of generic API error from upstream', async () => {

                const upstreamPath = '/error404';
                const cacheKey = Cache.utils.encodePath(upstreamPath);
                const endpoint = `/proxy${upstreamPath}`;

                // Issue original request
                const origReq = server.inject({
                    method: 'get',
                    url: endpoint
                });

                await Utils.sleep(1000);

                expect(await Cache.get(cacheKey)).to.exist();

                // Issue 2 more subsequent requests
                const req = server.inject({
                    method: 'get',
                    url: endpoint
                });

                const req2 = server.inject({
                    method: 'get',
                    url: endpoint
                });

                await Utils.sleep(500);

                expect(await Events.listenerCount(cacheKey)).to.equals(2);
                expect(await Cache.get(cacheKey)).to.exist();

                await Cache.forcefullyRemove(cacheKey, Cache.REMOVAL_REASONS.REQUEST_ERROR, Boom.notFound());

                expect(await Cache.get(cacheKey)).to.not.exist();

                return origReq.then(origResp => {
                    return req.then(res => {
                        return req2.then(async res2 => {
                            expect(origResp.statusCode).to.equals(404);
                            expect(origResp.headers).to.not.contain('x-cache');

                            expect(res.statusCode).to.equals(404);
                            expect(res.headers).to.contain('x-cache');
                            expect(res.headers['x-cache']).to.equals('QUEUE');

                            expect(res2.statusCode).to.equals(404);
                            expect(res2.headers).to.contain('x-cache');
                            expect(res2.headers['x-cache']).to.equals('QUEUE');

                            expect(await Events.listenerCount(cacheKey)).to.equals(0);
                        });
                    });
                })
            });

            it('Returns a proxy timeout if a topic subscription times out', async () => {

                const originalSubscriptionTimeout = Config.pubSub.subscriptionTimeout;
                Config.pubSub.subscriptionTimeout = 1000;

                const upstreamPath = '/comments';
                const cacheKey = Cache.utils.encodePath(upstreamPath);
                const endpoint = `/proxy${upstreamPath}`;

                Cache.add(cacheKey, {});

                // Issue original request
                const req = await server.inject({
                    method: 'get',
                    url: endpoint
                });

                // Reassign original Config settings so that we have no problems
                // with the next tests
                Config.pubSub.subscriptionTimeout = originalSubscriptionTimeout;

                expect(req.statusCode).to.equals(417);
                expect(JSON.parse(req.payload).message).to.equals('SUBSCRIPTION_TIMEOUT');

            })
        });

    });
};