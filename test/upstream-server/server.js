// server.js
const jsonServer = require('json-server');

const app = jsonServer.create();
const router = jsonServer.router(process.cwd() + '/test/upstream-server/db.json');
const middleware = jsonServer.defaults();
app.use(middleware);
app.use(router);


exports.start = async (port) => {
    return new Promise(resolve => {
        const server = app.listen(port, () => {
            console.log('JSON Server is running on port ' + port);
            resolve(server);
        })
    })
};