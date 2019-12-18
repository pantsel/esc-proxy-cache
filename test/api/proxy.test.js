'use strict';

module.exports = (Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils) => {
    describe('Proxy tests', {timeout: 15000},() => {
        let server;
        let upstreamServer;

        before(async () => {
            await Cache.setStrategy('memory').init();
            await Events.setStrategy('memory').init();
            upstreamServer = await jsonServer.start(3001);
            await upstreamServer.close();
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
};

