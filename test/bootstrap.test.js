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

// Api Tests
require('./api/basic.test')(Lab, { expect }, { before, after, describe, it }, { init });
require('./api/cache.test')(Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils);
require('./api/pubsub.test')(Lab, { expect }, { before, after, describe, it }, { init }, jsonServer, Cache, Events, Config, Utils);

// Unit Tests
require('./unit/unit.test')({expect}, { experiment, test });