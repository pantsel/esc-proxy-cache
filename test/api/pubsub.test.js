'use strict';



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

            it('It fulfills subsequent requests from the cache', { timeout: 15000 }, async () => {

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
                        expect(r2.headers['x-cache']).to.be.equal('PUB');

                        expect(r3.headers).to.contain('x-cache');
                        expect(r3.headers['x-cache']).to.be.equal('PUB');

                    });
            });
        });
    });
};
