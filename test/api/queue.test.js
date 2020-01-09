'use strict';

module.exports = (Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils, Queue) => {

    describe('Queue tests => Strategy: Memory', () => {
        let server;
        let upstreamServer;

        describe('Queue ready', () => {


            before(async () => {
                await Cache.setStrategy('memory').init();
                await Events.setStrategy('memory').init();
                await Queue.setStrategy('memory').init(Config.queue.name, {});
                upstreamServer = await jsonServer.start(3001, 4000, true);
                server = await init();
            });

            after(async () => {
                await Cache.flush();
                await Queue.close();
                await server.stop();
                await upstreamServer.close();
            });

            it('Holds subsequent requests and resolves them from the queue in case the first request returns an auth error',
              { timeout: 15000 }, async () => {

                  const endpoint = "/proxy/posts";

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
                              url: endpoint,
                              headers: {
                                  authorization: 'Bearer some_bearer_token'
                              }
                          }))
                      }, 1200)
                  });

                  return Promise.all([req1, req2, req3])
                    .then(([r1, r2, r3]) => {
                        expect(r1.statusCode).to.equal(401);
                        expect(r2.statusCode).to.equal(401);
                        expect(r3.statusCode).to.equal(200);

                        expect(r1.headers).to.not.contain('x-cache');

                        expect(r2.headers).to.contain('x-cache');
                        expect(r2.headers['x-cache']).to.be.equal('QUEUE');

                        expect(r3.headers).to.contain('x-cache');
                        expect(r3.headers['x-cache']).to.be.equal('QUEUE');
                        expect(JSON.parse(r3.payload)).to.be.an.array();

                    });
              });

        });

        describe('Queue not ready', () => {

            before(async () => {
                await Cache.setStrategy('memory').init();
                await Events.setStrategy('memory').init();
                upstreamServer = await jsonServer.start(3001, 4000, true);
                server = await init();
            });

            after(async () => {
                await Cache.flush();
                await server.stop();
                await upstreamServer.close();
            });

            it('Holds subsequent requests and resolves them from upstream in case the first request returns an auth error',
              { timeout: 15000 }, async () => {

                  const endpoint = "/proxy/posts";

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
                              url: endpoint,
                              headers: {
                                  authorization: 'Bearer some_bearer_token'
                              }
                          }))
                      }, 1200)
                  });

                  return Promise.all([req1, req2, req3])
                    .then(([r1, r2, r3]) => {
                        expect(r1.statusCode).to.equal(401);
                        expect(r2.statusCode).to.equal(401);
                        expect(r3.statusCode).to.equal(200);

                        expect(r1.headers).to.not.contain('x-cache');

                        expect(r2.headers).to.not.contain('x-cache');

                        expect(r3.headers).to.not.contain('x-cache');

                    });
              });

        });
    })
};

