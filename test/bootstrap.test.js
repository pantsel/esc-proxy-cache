'use strict';
require('dotenv').config();

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { before, after, describe, it, experiment, test } = exports.lab = Lab.script();
const { init } = require('../lib/server');
const jsonServer = require('./upstream-server/server');
const Cache = require('../lib/cache');
const Events = require('../lib/events');
const Config = require('../config');
const Utils = require('../lib/utils');

describe('API tests', () => {
    require('./api/basic.test')(Lab, { expect }, { before, after, describe, it }, { init });
    require('./api/proxy.test')(Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils);
    require('./api/cache.test')(Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils);
    require('./api/pubsub.test')(Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils);
    require('./api/error-handling.test')(Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils);

});

describe('Unit tests', () => {
    require('./unit/unit.test')({expect}, { experiment, test });
});