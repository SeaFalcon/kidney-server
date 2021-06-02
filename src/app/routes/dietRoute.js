module.exports = function (app) {
  const diet = require("../controllers/dietController");
  // const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.post("/diet", diet.saveDiet);
};
