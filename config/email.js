let nodemailer = require("nodemailer"); //노드메일러 모듈을 사용할 거다!

// 메일발송 함수

let transporter = nodemailer.createTransport({
  service: "gmail", //사용하고자 하는 서비스
  prot: 587,
  host: "smtp.gmlail.com",
  secure: false,
  requireTLS: true,
  auth: {
    user: "haillydev@gmail.com", //gmail주소입력
    pass: "pp980101!!", //gmail패스워드 입력
  },
});

module.exports = {
  transporter,
};
