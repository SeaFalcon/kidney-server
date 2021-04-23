const jwtMiddleware = require('../../../config/jwtMiddleware');
const image = require('../controllers/dialysisController')

module.exports = (app, upload) => {
  app.post('/hemodialysis-memo', jwtMiddleware, upload.single('image'), image.saveHemodialysisMemo);
};
