const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');
require('dotenv').config();

// file upload
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const AWS = require('aws-sdk');
module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));

    app.use(methodOverride());

    app.use(cors());
    // app.use(express.static(process.cwd() + '/public'));

    // aws-s3 upload
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
        region: 'ap-northeast-2',
    });

    const s3 = new AWS.S3();

    const upload = multer({
        storage: multerS3({
            s3,
            bucket: 'chlngersimage',
            key(req, file, cb) {
                const extension = path.extname(file.originalname);
                cb(null, Date.now().toString() + extension);
            },
            acl: 'public-read-write',
        }),
        // limits: { fileSize: 5 * 1024 * 1024 },
    });


    /* App (Android, iOS) */
    require('../src/app/routes/indexRoute')(app);
    require('../src/app/routes/userRoute')(app);
    require('../src/app/routes/foodRoute')(app);
    require('../src/app/routes/dialysisRoute')(app, upload);

    /* Web */
    // require('../src/web/routes/indexRoute')(app);

    /* Web Admin*/
    // require('../src/web-admin/routes/indexRoute')(app);
    return app;
};