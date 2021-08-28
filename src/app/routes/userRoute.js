module.exports = function (app) {
  const user = require("../controllers/userController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  app.route("/app/signUp").post(user.signUp);
  app.route("/app/signIn").post(user.signIn);
  app.route("/app/Emailcheck").post(user.Emailcheck);
  //app.route("/app/EmailValidation").post(user.EmailValidation);

  app.get("/check", jwtMiddleware, user.check);

  app.post("/user", user.signUp);
  app.post("/login", user.signIn);
  app.post("/emailCheck", user.Emailcheck);
  app.post("/EmailValidation", user.EmailValidation);
  app.post("/nicknameCheck", user.Nicknamecheck);
  app.post("/user/saveKidney01", jwtMiddleware, user.saveKidney01);
  app.post("/user/saveKidney02", jwtMiddleware, user.saveKidney02);

  app.post("/kakao", user.kakaoLogin);
  app.post("/user/kakao", jwtMiddleware, user.saveKakaoUserInfo);

  app.patch("/user/password", jwtMiddleware, user.changePassword);

  app.put("/user", jwtMiddleware, user.changeBasicInfo);
  app.put("/user/nutirition", jwtMiddleware, user.changeBasicNutrition);

  app.get("/me", jwtMiddleware, user.getMyInfo);

  //   app.post("/EmailValidation", async function (req, res) {
  //     let authNum = Math.random().toString().substr(2, 6);

  //     const { email } = req.body;

  //     console.log(email);

  //     // 메일발송 함수

  //     let transporter = nodemailer.createTransport({
  //       service: "gmail", //사용하고자 하는 서비스
  //       prot: 587,
  //       host: "smtp.gmlail.com",
  //       secure: false,
  //       requireTLS: true,
  //       auth: {
  //         user: "haillydev@gmail.com", //gmail주소입력
  //         pass: "pp980101!!", //gmail패스워드 입력
  //       },
  //     });

  //     let info = await transporter
  //       .sendMail({
  //         from: "haillydev@gmail.com", //보내는 주소 입력
  //         to: email, //위에서 선언해준 받는사람 이메일
  //         subject: "드림찬 고객님 인증 번호 안내드립ㄴ디ㅏ. ", // Subject line
  //         text: "", // plain text body
  //         html: `<h1>dream chan</h1>
  //          <h3>고객님 안녕하세요</h3>
  //          <h4>드림찬과 함께 해주셔서 감사합니다. 어플리케이션에서 인증번호를 입력해주세요. ${authNum} </h4>`,
  //         // html body
  //       })
  //       .then((res) => console.log(res));
  //   });
  // };
};
