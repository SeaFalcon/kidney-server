const jwtMiddleware = require('../../../config/jwtMiddleware');
const dialysis = require('../controllers/dialysisController')

module.exports = (app, upload) => {
  app.post('/hemodialysis-memo', jwtMiddleware, upload.single('image'), dialysis.saveHemodialysisMemo);
  app.get('/hemodialysis-memo', jwtMiddleware, dialysis.getHemodialysisMemo);
};
