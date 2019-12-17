'use strict';

require('dotenv').config();

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { before, after, describe, it } = exports.lab = Lab.script();
const { init } = require('../../lib/server');
const jsonServer = require('../upstream-server/server');
const Cache = require('../../lib/cache');
const Events = require('../../lib/events');

describe('Cache tests', () => {
    let server;
    let upstreamServer;

    before(async () => {
        await Cache.setStrategy('memory').init();
        await Events.setStrategy('memory').init();
        upstreamServer = await jsonServer.start(3001);
        server = await init();
    });

    after(async () => {
        await server.stop();
        upstreamServer.close();
    });

    it('It cashes GET requests to a tracked endpoint', async () => {

        const endpoint = '/proxy/posts/2';

        const res1 = await server.inject({
            method: 'get',
            url: endpoint
        });

        const res1Headers = res1.headers;

        const res2 = await server.inject({
            method: 'get',
            url: endpoint
        });

        const res2Headers = res2.headers;

        expect(res1.statusCode).to.equal(200);
        expect(res2.statusCode).to.equal(200);

        expect(res1Headers).to.not.contain('x-cache');
        expect(res2Headers).to.contain('x-cache');
        expect(res2Headers['x-cache']).to.be.equal('HIT');

    });

    it("does not cache requests to untracked endpoints", async () => {
        const endpoint = '/proxy/profile';

        await server.inject({
            method: 'get',
            url: endpoint
        });

        const cacheKey = "/profile";
        const cachedRequest = await Cache.get(cacheKey);

        expect(cachedRequest).to.be.undefined();
    });
});