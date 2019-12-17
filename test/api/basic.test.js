'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { before, after, describe, it } = exports.lab = Lab.script();
const { init } = require('../../lib/server');

describe('Basic test', () => {
    let server;

    before(async () => {
        server = await init();
    });

    after(async () => {
        await server.stop();
    });

    it('responds with 200 on /api/v1/info', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/api/v1/info'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.contains(['version', 'date']);
    });

    it('responds to health checks', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/api/v1/health'
        });
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.be.string().equal('OK');
    });
});