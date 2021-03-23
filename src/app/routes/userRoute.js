module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/app/signUp').post(user.signUp);
    app.route('/app/signIn').post(user.signIn);
    app.route('/app/Emailcheck').post(user.Emailcheck);

    app.get('/check', jwtMiddleware, user.check);

    app.post('/user', user.signUp);
    app.post('/login', user.signIn);
    app.post('/emailCheck', user.Emailcheck);
    app.post('/nicknameCheck', user.Nicknamecheck);

    app.post('/kakao', user.kakaoLogin);
    app.post('/user/kakao', jwtMiddleware, user.saveKakaoUserInfo)

    app.patch('/user/password', jwtMiddleware, user.changePassword);
    app.patch('/user/weight', jwtMiddleware, user.changeWeight);
    app.patch('/user/kidneyType', jwtMiddleware, user.changeKidneyType);
    app.patch('/user/activityId', jwtMiddleware, user.changeActivityId);

    app.get('/user/:id', jwtMiddleware, user.getUserById);
};