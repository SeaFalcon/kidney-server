const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');
require('dotenv').config();
module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());
    // app.use(express.static(process.cwd() + '/public'));

    /* App (Android, iOS) */
    require('../src/app/routes/indexRoute')(app);
    require('../src/app/routes/userRoute')(app);

    /* Web */
    // require('../src/web/routes/indexRoute')(app);

    /* Web Admin*/
    // require('../src/web-admin/routes/indexRoute')(app);
    return app;
};