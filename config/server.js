const fs = require('fs');

module.exports = {
    tls: {
        key: fs.readFileSync(process.env.TLS_KEY || process.cwd() + '/secrets/alice.key'),
        cert: fs.readFileSync(process.env.TLS_CRT || process.cwd() +  '/secrets/alice.crt')
    },
    options: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || '0.0.0.0',
        tls: true
    }
}