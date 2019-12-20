'use strict';

const Boom = require('@hapi/boom');

module.exports = (Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils) => {
    describe('PubSub tests', () => {
        let server;
        let upstreamServer;

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

        describe('If a response for an already requested endpoint is not yet available in cache', () => {
            it('It initializes a GET request to cache', { timeout: 15000 }, async () => {
                const upstreamPath = '/posts/2';
                const cacheKey = Cache.utils.encodePath(upstreamPath);
                const endpoint = `/proxy${upstreamPath}`;

                const req =  server.inject({
                    method: 'get',
                    url: endpoint
                });

                await Utils.sleep(500);

                const cachedItem = await Cache.get(cacheKey);

                expect(cachedItem).to.exist();
                expect(cachedItem).to.only.contain('requestHeaders');
                expect(cachedItem).to.not.contain('response');

                return req.then(res => {
                    expect(res.statusCode).to.equals(200);
                })

            });

            it('It fulfills subsequent requests from the queue', { timeout: 15000 }, async () => {

                const endpoint = "/proxy/posts/1";

                const req1 = server.inject({
                    method: 'get',
                    url: endpoint
                });

                const req2 = new Promise(resolve => {
                    setTimeout(() => {
                        resolve(server.inject({
                            method: 'get',
                            url: endpoint
                        }))
                    }, 1000)
                });

                const req3 = new Promise(resolve => {
                    setTimeout(() => {
                        resolve(server.inject({
                            method: 'get',
                            url: endpoint
                        }))
                    }, 1200)
                });

                return Promise.all([req1, req2, req3])
                    .then(([r1, r2, r3]) => {
                        expect(r1.statusCode).to.equal(200);
                        expect(r2.statusCode).to.equal(200);
                        expect(r3.statusCode).to.equal(200);

                        expect(r1.headers).to.not.contain('x-cache');

                        expect(r2.headers).to.contain('x-cache');
                        expect(r2.headers['x-cache']).to.be.equal('QUEUE');

                        expect(r3.headers).to.contain('x-cache');
                        expect(r3.headers['x-cache']).to.be.equal('QUEUE');

                    });
            });
        });

        describe('Error handling',  {timeout: 10000}, async () => {
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

                expect(req.statusCode).to.equals(417);
                expect(JSON.parse(req.payload).message).to.equals('SUBSCRIPTION_TIMEOUT');



            })
        })
    });
};