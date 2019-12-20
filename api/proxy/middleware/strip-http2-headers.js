'use strict';

const _ = require('lodash');

const StripHttp2HeadersMiddleware = {
    method: async (request, h) => {
        request.headers = _.pickBy(request.headers, function (value, key) {
            return !_.startsWith(key, ":");
        });

        return h.continue;
    },
    assign: 'mStripHttp2Headers'
};

module.exports = StripHttp2HeadersMiddleware;