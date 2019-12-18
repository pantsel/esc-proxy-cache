'use strict';

require('dotenv').config();

module.exports = (Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils) => {
    describe('PubSub tests', () => {
        let server;
        let upstreamServer;

        before(async () => {
            upstreamServer = await jsonServer.start(3001, 5000);
            server = await init();
        });

        after(async () => {
            await server.stop();
            upstreamServer.close();
        });

        describe('If a response for an already requested endpoint is not yet available in cache', () => {
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

    });
};