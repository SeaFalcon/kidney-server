module.exports = function (app) {
  const food = require('../controllers/foodController');
  const jwtMiddleware = require('../../../config/jwtMiddleware');

  app.get('/foods', jwtMiddleware, food.findFoods);

  app.get('/food-record', jwtMiddleware, food.getFoodRecord);

  app.get('/food-record/date', jwtMiddleware, food.getNutrition);

  app.post('/food-record/date', jwtMiddleware, food.getFoodRecordWithDate);

  app.post('/food-record', jwtMiddleware, food.saveFoodRecord);

  app.delete('/food-record', jwtMiddleware, food.removeFoodRecord);

  app.delete('/food-record/:foodIntakeRecordId', jwtMiddleware, food.removeFoodRecordsByMealTime);

  app.get('/food-category', jwtMiddleware, food.getFoodCategory);

  app.get('/foods/category', jwtMiddleware, food.findFoodsByCategory);
};
