module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/app/signUp').post(user.signUp);
    app.route('/app/signIn').post(user.signIn);

    app.get('/check', jwtMiddleware, user.check);

    app.post('/user', user.signUp);
    app.post('/login', user.signIn);


    //app.patch('./user', jwtMiddleware, user.updateUserName);
};