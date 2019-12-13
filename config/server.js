const fs = require('fs');

module.exports = {
    tls: {
        key: fs.readFileSync(process.env.SERVER_TLS_KEY || process.cwd() + '/secrets/alice.key'),
        cert: fs.readFileSync(process.env.SERVER_TLS_CRT || process.cwd() +  '/secrets/alice.crt'),
        allowHTTP1: true
    },
    options: {
        port: process.env.SERVER_OPTIONS_PORT || 3000,
        host: process.env.SERVER_OPTIONS_HOST || '0.0.0.0',
        tls: process.env.SERVER_OPTIONS_TLS ? process.env.SERVER_OPTIONS_TLS == 'true' ? true : false : true
    }
}