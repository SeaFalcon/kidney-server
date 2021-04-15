module.exports = function (app) {
  const food = require('../controllers/foodController');
  const jwtMiddleware = require('../../../config/jwtMiddleware');

  app.get('/foods', jwtMiddleware, food.findByFoodName);

  app.get('/food-record', jwtMiddleware, food.getFoodRecord);

  app.get('/food-record/date', jwtMiddleware, food.getNutrition);

  app.post('/food-record/date', jwtMiddleware, food.getFoodRecordWithDate);

  app.post('/food-record', jwtMiddleware, food.saveFoodRecord);

  app.delete('/food-record', jwtMiddleware, food.removeFoodRecord);
};
