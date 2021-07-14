const jwtMiddleware = require("../../../config/jwtMiddleware");
const dialysis = require("../controllers/dialysisController");
const { uploadMiddleware } = require("../../../config/s3");
module.exports = (app) => {
  app.post(
    "/hemodialysis-memo",
    jwtMiddleware,
    uploadMiddleware.single("image"),
    dialysis.saveHemodialysisMemo
  );
  app.post(
    "/peritoneum-memo",
    jwtMiddleware,
    uploadMiddleware.single("image"),
    dialysis.savePeritonrumMemo
  );
  app.get("/hemodialysis-memo", jwtMiddleware, dialysis.getHemodialysisMemo);
  app.get("/peritoneum-memo", jwtMiddleware, dialysis.getWeekPeritonrumMemo);
  app.put(
    "/hemodialysis-memo",
    jwtMiddleware,
    uploadMiddleware.single("image"),
    dialysis.changeHemodialysisMemo
  );
  app.put(
    "/peritoneum-memo",
    jwtMiddleware,
    uploadMiddleware.single("image"),
    dialysis.changePeritonrumMemo
  );
};
