'use strict';

const AddXTryHeaderMiddleware = {
    method: async (request, h) => {
        if(!request.headers['x-try']) request.headers['x-try'] = 1;
        return h.continue;
    },
    assign: 'mAddXTryHeader'
};

module.exports = AddXTryHeaderMiddleware;