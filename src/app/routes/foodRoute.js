module.exports = function (app) {
  const food = require('../controllers/foodController');
  const jwtMiddleware = require('../../../config/jwtMiddleware');

  app.get('/foods', jwtMiddleware, food.findByFoodName);

  app.get('/food-record', jwtMiddleware, food.getFoodRecord);

  app.post('/food-record', jwtMiddleware, food.saveFoodRecord);
};
