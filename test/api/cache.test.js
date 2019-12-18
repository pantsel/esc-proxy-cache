'use strict';

require('dotenv').config();

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { before, after, describe, it } = exports.lab = Lab.script();
const { init } = require('../../lib/server');
const jsonServer = require('../upstream-server/server');
const Cache = require('../../lib/cache');
const Events = require('../../lib/events');
const Config = require('../../config');
const Utils = require('../../lib/utils');

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
        await Cache.flush();
        await server.stop();
        await upstreamServer.close();
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

    describe('Cache Invalidation', () => {

        const endpoint = '/proxy/comments';

        it("Serves the first request from the server", async () => {
            const res = await server.inject({
                method: 'get',
                url: endpoint
            });
            expect(res.statusCode).to.equals(200);
            expect(res.headers).not.to.contain('x-cache');
        });

        it("Serves the second request from the cache", async () => {
            const res = await server.inject({
                method: 'get',
                url: endpoint
            });
            expect(res.statusCode).to.equals(200);
            expect(res.headers).to.contain('x-cache');
            expect(res.headers['x-cache']).to.equals('HIT');
            expect(await Cache.get('/comments')).to.exist();
        });

        it("Invalidates cache on POST request to the same endpoint", async () => {
            const res = await server.inject({
                method: 'post',
                url: endpoint,
                payload: {
                    "body": "some test comment",
                    "postId": 1
                }
            });

            expect(res.statusCode).to.equals(201);
            expect(await Cache.get('/comments')).to.be.undefined();
        });

        it("Should proxy the subsequent GET request to the upstream server", async () => {
            const res = await server.inject({
                method: 'get',
                url: endpoint
            });

            expect(res.statusCode).to.equals(200);
            expect(res.headers).not.to.contain('x-cache');
        })
    });

    it('Extends cache item expiration with every cache HIT', async () => {

        const endpoint = '/proxy/posts';
        Config.cache.ttl = 3000;

        await server.inject({
            method: 'get',
            url: endpoint
        });

        await Utils.sleep(10);

        const cacheItem1 = await Cache.get('/posts');
        const expiration1 = cacheItem1.expiration;

        await server.inject({
            method: 'get',
            url: endpoint
        });

        const cacheItem2 = await Cache.get('/posts');
        let expiration2 = cacheItem2.expiration;

        expect(expiration2 > expiration1).to.be.true();







    })
});