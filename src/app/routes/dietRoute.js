module.exports = function (app) {
  const diet = require("../controllers/dietController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.get("/diet", jwtMiddleware, diet.saveDiet);
  app.post("/diet", diet.saveDiet);
};
