// server.js

exports.start = async (port, delay) => {
    const jsonServer = require('json-server');
    const app = jsonServer.create();
    const router = jsonServer.router(require(process.cwd() + '/test/upstream-server/db.json'));
    const middleware = jsonServer.defaults();

    app.use(middleware);
    app.get('/error504', (req, res) => {
        res.status(504).jsonp({
            error: "Error message"
        })
    });
    app.get('/error501', (req, res) => {
        res.status(501).jsonp({
            error: "Error message"
        })
    });
    app.get('/error404', (req, res) => {
        res.status(404).jsonp({
            error: "Error message"
        })
    });
    app.use(function(req, res, next){
        setTimeout(next, delay);
    });
    app.use(router);

    return new Promise(resolve => {
        const server = app.listen(port, () => {
            // console.log('JSON Server is running on port ' + port);
            resolve(server);
        })
    })
};