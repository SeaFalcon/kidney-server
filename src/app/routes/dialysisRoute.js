const jwtMiddleware = require('../../../config/jwtMiddleware');
const dialysis = require('../controllers/dialysisController')
const { uploadMiddleware } = require('../../../config/s3');
module.exports = (app) => {
  app.post('/hemodialysis-memo', jwtMiddleware, uploadMiddleware.single('image'), dialysis.saveHemodialysisMemo);
  app.get('/hemodialysis-memo', jwtMiddleware, dialysis.getHemodialysisMemo);
  app.put('/hemodialysis-memo', jwtMiddleware, uploadMiddleware.single('image'), dialysis.changeHemodialysisMemo);
  app.delete('/hemodialysis-memo/:dialysisId', jwtMiddleware, dialysis.removeHemodialysisMemo);
}
