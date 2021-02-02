const http = require("http");
const express = require("express");
const envVariable = require("./config/envValues.js");
const db = require('./database/db.js');

let server;
let app = express();
app.set('port', envVariable.port);
db.connect('mode', function (err) {
    if (err) {
        console.log('Unable to connect to MySQL.', err)
    } else {
        require("./ConfigApp").configureExpressApp(app);
        server = http.createServer(app);
        server.listen(app.get('port'), function () {
            console.log('Express server listening on port ' + app.get('port'));
        });
    }
});

