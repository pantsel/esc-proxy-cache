// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(`${process.cwd()}/test/upstream-server/db.json`);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(function(req, res, next){
    setTimeout(next, 5000);
});
server.use((req, res, next) => {
    if (req.headers.authorization) { // add your authorization logic here
        next() // continue to JSON Server router
    } else {
        res.sendStatus(401)
    }
});
server.use(router);
server.listen(3001, () => {
    console.log('JSON Server is running')
});