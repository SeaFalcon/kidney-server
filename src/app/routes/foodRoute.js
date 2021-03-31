module.exports = function (app) {
  const food = require('../controllers/foodController');
  const jwtMiddleware = require('../../../config/jwtMiddleware');

  app.get('/foods', food.findByFoodName);
  // app.get('/food/:id', food.findByFoodId);

  app.get('/food-record', food.getFoodRecord);

  app.post('/food-record', food.saveFoodRecord);
  // app.post('/food-record', jwtMiddleware, food.saveFoodRecord);
};
