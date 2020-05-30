const express = require('express');
const ProductionWebsiteStaticsFilesRouter = require('./routes/prodStaticFilesRouter.js');
const webServiceRouter = require("./routes/webserviceRouter.js");
const path = require('path');

let errorHandler = function (err, req, res, next) {
    console.log(err.stack)
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.json({ error: err });
};

function redirectHttpToHttps(req, res, next) {
    if ((!req.secure) && req.get('X-Forwarded-Proto') && (req.get('X-Forwarded-Proto') !== 'http')) {
        res.redirect('http://' + 'edusamadhan.com' + req.url);
    }
    else
        next();
}
function blockDotMapFiles(req, res, next) {
    res.status(404).end();
}

function mountRoutes(app, passport) {
    if (app.settings.env === 'production') {
        app.use(redirectHttpToHttps);
        app.use('*.map', blockDotMapFiles);
    }
    app.use('/api', webServiceRouter(passport));
    app.use(errorHandler);
}

function mountStaticSite(app) {
    app.use('/HomepageAssest', ProductionWebsiteStaticsFilesRouter());
    app.use('/', express.static(path.join(__dirname, 'reactclient'), {
        maxAge: 86400000 * 365,
        index: false
    }));
    app.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, 'reactclient', 'index.html'));
    });
}

exports.mountRoutes = mountRoutes;
exports.mountStaticSite = mountStaticSite;