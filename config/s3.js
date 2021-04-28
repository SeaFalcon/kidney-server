const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const AWS = require('aws-sdk');

// aws-s3 upload
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  region: 'ap-northeast-2',
});

const s3 = new AWS.S3();

const uploadMiddleware = multer({
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

module.exports = {
  uploadMiddleware,
  s3
}