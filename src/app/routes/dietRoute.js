module.exports = function (app) {
  const diet = require("../controllers/dietController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.get("/diet", jwtMiddleware, diet.getDites);
  app.get("/diet-all", jwtMiddleware, diet.getAllDiet);
  app.get("/diet-recipe", jwtMiddleware, diet.getRecipe);
  app.post("/diet", diet.saveDiet);
};
