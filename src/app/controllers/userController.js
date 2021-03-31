const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const axios = require("axios").default;

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const userDao = require("../dao/userDao");
//const {Calc} = require("../module/Calc");
let {Mheight, age, Mcalorie, Fcalorie, potassium, unnomalprotein, nomalprotein, unomalPhosphorus, nomalPhosphorus, Sodium} = require("../module/Calc");

/**
 update : 2020.10.4
 01.signUp API = 회원가입
 */
exports.signUp = async function (req, res) {
  const {
    email,
    password,
    nickname,
    height,
    weight,
    gender,
    kidneyType,
    birth,
    activityId, //, nickname
  } = req.body;

  console.log(req.body);
  if (!email)
    return res.json({
      isSuccess: false,
      code: 301,
      message: "이메일을 입력해주세요.",
    });
  if (email.length > 30)
    return res.json({
      isSuccess: false,
      code: 302,
      message: "이메일은 30자리 미만으로 입력해주세요.",
    });

  if (!regexEmail.test(email))
    return res.json({
      isSuccess: false,
      code: 303,
      message: "이메일을 형식을 정확하게 입력해주세요.",
    });

  if (!password)
    return res.json({
      isSuccess: false,
      code: 304,
      message: "비밀번호를 입력 해주세요.",
    });
  if (password.length < 6 || password.length > 20)
    return res.json({
      isSuccess: false,
      code: 305,
      message: "비밀번호는 6~20자리를 입력해주세요.",
    });

  if (!nickname)
    return res.json({
      isSuccess: false,
      code: 400,
      message: "닉네임을 입력 해주세요.",
    });
  if (nickname.length > 10)
    return res.json({
      isSuccess: false,
      code: 400,
      message: "닉네임은 최대 10자리까지 입력해주세요. ",
    });

  try {
    // 이메일 중복 확인
    const emailRows = await userDao.userEmailCheck(email);
    if (emailRows.length > 0) {
      return res.json({
        isSuccess: false,
        code: 308,
        message: "중복된 이메일입니다.",
      });
    }

    const ninknameRows = await userDao.userNicknameCheck(nickname);
    if (ninknameRows.length > 0) {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "중복된 닉네임 입니다.",
      });
    }

    // TRANSACTION : advanced
    // await connection.beginTransaction(); // START TRANSACTION
    const hashedPassword = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");
    const insertUserInfoParams = [
      email,
      hashedPassword,
      nickname,
      height,
      weight,
      gender,
      kidneyType,
      birth,
      activityId,
    ];


    const [[activityRow]] = await userDao.selectActivity(activityId);
    const [kidneyTypeRows] = await userDao.selectKidney(kidneyType);
    let Mheight2 = Mheight(height);
    let age2 = age(birth);
    let activity = activityRow.pa;
    let kidney = kidneyTypeRows.protein;

    const inserNutritionParams = [
      (requiredCalorie =
          gender === "M"
              ? Mcalorie(weight, age2, Mheight2, activity)
              : Fcalorie(weight, age2, Mheight2, activity)),
      (requiredPhosphorus =
          kidneyType === 2 ? unomalPhosphorus(Mheight2) : nomalPhosphorus(age2)),
      (requiredSodium = Sodium(age2)),
      (requiredPotassium = potassium()),
      (requiredProtein =
          kidneyType === 7
              ? unnomalprotein(gender, age2)
              : nomalprotein(gender, Mheight2, kidney)),
    ];

    console.log(inserNutritionParams);

    const insertUserRows = await userDao.insertUserInfo(insertUserInfoParams);
    const inserNutritionRows = await userDao.insertuserRequiredNuturition(
      inserNutritionParams
    );



    return res.json({
      isSuccess: true,
      code: 200,
      message: "회원가입 성공",
    });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

/**
update : 2020.10.4
02.signIn API = 로그인
**/
exports.signIn = async function (req, res) {
  const { email, password } = req.body;

  console.log(req.body);

  if (!email)
    return res.json({
      isSuccess: false,
      code: 301,
      message: "이메일을 입력해주세요.",
    });
  if (email.length > 30)
    return res.json({
      isSuccess: false,
      code: 302,
      message: "이메일은 30자리 미만으로 입력해주세요.",
    });

  if (!regexEmail.test(email))
    return res.json({
      isSuccess: false,
      code: 303,
      message: "이메일을 형식을 정확하게 입력해주세요.",
    });

  if (!password)
    return res.json({
      isSuccess: false,
      code: 304,
      message: "비밀번호를 입력 해주세요.",
    });
  try {
    const [userInfoRows] = await userDao.selectUserInfo(email);

    if (userInfoRows.length < 1) {
      // connection.release();
      return res.json({
        isSuccess: false,
        code: 310,
        message: "아이디를 확인해주세요.",
      });
    }

    const hashedPassword = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");
    if (userInfoRows[0].pw !== hashedPassword) {
      // connection.release();
      return res.json({
        isSuccess: false,
        code: 311,
        message: "비밀번호를 확인해주세요.",
      });
    }

    // if (userInfoRows[0].status === "INACTIVE") {
    //     connection.release();
    //     return res.json({
    //         isSuccess: false,
    //         code: 312,
    //         message: "비활성화 된 계정입니다. 고객센터에 문의해주세요."
    //     });
    // } else if (userInfoRows[0].status === "DELETED") {
    //     connection.release();
    //     return res.json({
    //         isSuccess: false,
    //         code: 313,
    //         message: "탈퇴 된 계정입니다. 고객센터에 문의해주세요."
    //     });
    // }

    //토큰 생성
    let token = await jwt.sign(
      {
        id: userInfoRows[0].userId,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀 키
      {
        expiresIn: "365d",
        subject: "userInfo",
      } // 유효 시간은 365일
    );
    console.log(req.body);
    res.json({
      userInfo: {
        id: userInfoRows[0].userId,
      },
      jwt: token,
      isSuccess: true,
      code: 200,
      message: "로그인 성공",
    });

    // connection.release();
  } catch (err) {
    logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
    // connection.release();
    return false;
  }
};

/**
 update : 2019.09.23
 03.check API = token 검증
 **/
exports.check = async function (req, res) {
  res.json({
    isSuccess: true,
    code: 200,
    message: "검증 성공",
    info: req.verifiedToken,
  });
};

exports.kakaoLogin = async function (req, res) {
  const { accessToken } = req.body;
  console.log(accessToken);

  try {
    const {
      data: {
        id: kakaoId,
        kakao_account: {
          email,
          profile: { nickname, profile_image_url: profileImageUrl },
        },
      },
    } = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const [userInfoRows] = await userDao.findUserByKakaoId(kakaoId);

    // 로그인
    if (userInfoRows.length) {
      //토큰 생성
      let token = await jwt.sign(
        {
          id: userInfoRows[0].userId,
        }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀 키
        {
          expiresIn: "365d",
          subject: "userInfo",
        } // 유효 시간은 365일
      );

      return res.json({
        userInfo: {
          id: userInfoRows[0].userId,
        },
        jwt: token,
        isSuccess: true,
        code: 200,
        message: "카카오 로그인 성공",
      });
      // 회원가입
    } else {
      const [insertResult] = await userDao.insertKakaoUser(
        email,
        nickname,
        profileImageUrl,
        kakaoId
      );

      if (insertResult.insertId) {
        const [userRows] = await userDao.findUserByKakaoId(kakaoId);

        let token = await jwt.sign(
          {
            id: userRows[0].userId,
          }, // 토큰의 내용(payload)
          secret_config.jwtsecret, // 비밀 키
          {
            expiresIn: "365d",
            subject: "userInfo",
          } // 유효 시간은 365일
        );

        return res.json({
          userInfo: {
            id: userRows[0].userId,
            // nickname: userRows[0].nickname,
            // profileImageUrl: userRows[0].profileImageUrl,
            // loginType: 'kakao',
          },
          jwt: token,
          isSuccess: true,
          code: 200,
          message: "카카오 회원가입 및 로그인 성공",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({ code: 400, message: "카카오 회원가입 및 로그인 실패" });
  }
};
//이메일 중복체크 버튼 클릭 API
exports.Emailcheck = async function (req, res) {
  const { email } = req.body;

  try {
    // 이메일 중복 확인
    const emailRows = await userDao.userEmailCheck(email);
    if (emailRows.length > 0) {
      return res.json({
        isSuccess: false,
        code: 308,
        message: "중복된 이메일입니다.",
      });
    } else {
      return res.json({
        isSuccess: true,
        code: 308,
        message: "success.",
      });
    }
  } catch (err) {
    // await connection.rollback(); // ROLLBACK
    // connection.release();
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 닉네임 체크 API
exports.Nicknamecheck = async function (req, res) {
  const { nickname } = req.body;
  try {
    // 이메일 중복 확인
    const nicknameRows = await userDao.userNicknameCheck(nickname);
    if (nicknameRows.length > 0) {
      return res.json({
        isSuccess: false,
        code: 308,
        message: "중복된 이메일입니다.",
      });
    } else {
      return res.json({
        isSuccess: true,
        code: 308,
        message: "success.",
      });
    }
  } catch (err) {
    // await connection.rollback(); // ROLLBACK
    // connection.release();
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.saveKakaoUserInfo = async function (req, res) {
  const {
    body: { height, weight, gender, kidneyType, birth, activityId },
    verifiedToken: { id },
  } = req;

  try {
    const updateKakaoUserInfoParams = [
      height,
      weight,
      gender,
      kidneyType,
      birth,
      activityId,
      id,
    ];

    const [updateKakaoUserRows] = await userDao.updateKakaoUserInfo(
      updateKakaoUserInfoParams
    );

    console.log(updateKakaoUserRows);

    const [[activityRow]] = await userDao.selectActivity(activityId);
    const [kidneyTypeRows] = await userDao.selectKidney(kidneyType);

    let Mheight2 = Mheight(height);
    let age2 = age(birth);
    let activity = activityRow.pa;
    let kidney = kidneyTypeRows.protein;

    const inserNutritionParams = [
      (requiredCalorie =
          gender === "M"
              ? Mcalorie(weight, age2, Mheight2, activity)
              : Fcalorie(weight, age2, Mheight2, activity)),
      (requiredPhosphorus =
          kidneyType === 2 ? unomalPhosphorus(Mheight2) : nomalPhosphorus(age2)),
      (requiredSodium = Sodium(age2)),
      (requiredPotassium = potassium()),
      (requiredProtein =
          kidneyType === 7
              ? unnomalprotein(gender, age2)
              : nomalprotein(gender, Mheight2, kidney)),
    ];

    console.log(inserNutritionParams);

    const inserNutritionRows = await userDao.insertuserRequiredNuturition(
        inserNutritionParams
    );


    if (updateKakaoUserRows.affectedRows) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "카카오 회원가입 (추가정보 입력) 성공",
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "카카오 회원가입 (추가정보 입력) 실패",
      });
    }
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.changePassword = async function (req, res) {
  const {
    body: { current, willBeChanged },
    verifiedToken: { id },
  } = req;

  if (!willBeChanged)
    return res.json({
      isSuccess: false,
      code: 304,
      message: "비밀번호를 입력 해주세요.",
    });
  if (willBeChanged.length < 6 || willBeChanged.length > 20)
    return res.json({
      isSuccess: false,
      code: 305,
      message: "비밀번호는 6~20자리를 입력해주세요.",
    });

  try {
    const hashedCurrentPassword = await crypto
      .createHash("sha512")
      .update(current)
      .digest("hex");

    const [userInfoRows] = await userDao.findUserByUserId(id);

    if (userInfoRows.length < 1) {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "현재 패스워드를 확인해주세요.",
      });
    } else {
      if (userInfoRows[0].pw === hashedCurrentPassword) {
        const hashedWillBeChangedPassword = await crypto
          .createHash("sha512")
          .update(willBeChanged)
          .digest("hex");
        const [updatePasswordRow] = await userDao.updatePassword(
          hashedWillBeChangedPassword,
          id
        );

        if (updatePasswordRow.affectedRows) {
          return res.json({
            isSuccess: true,
            code: 200,
            message: "패스워드 변경 성공",
          });
        } else {
          return res.json({
            isSuccess: false,
            code: 400,
            message: "패스워드 변경 실패",
          });
        }
      }
    }
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.changeBasicInfo = async function (req, res) {
  const {
    body: { weight, kidneyType, activityId },
    verifiedToken: { id },
  } = req;

  console.log(weight, kidneyType, activityId);

  if (!weight)
    return res.json({
      isSuccess: false,
      code: 304,
      message: "몸무게를 입력 해주세요.",
    });
  if (!typeof weight === "number")
    return res.json({
      isSuccess: false,
      code: 400,
      message: "몸무게는 숫자만 입력해주세요.",
    });

  if (!kidneyType)
    return res.json({
      isSuccess: false,
      code: 304,
      message: "건강상태를 입력 해주세요.",
    });
  if (!typeof kidneyType === "number")
    return res.json({
      isSuccess: false,
      code: 400,
      message: "건강상태는 숫자만 입력해주세요.",
    });

  if (!activityId)
    return res.json({
      isSuccess: false,
      code: 304,
      message: "활동수준을 입력 해주세요.",
    });
  if (!typeof activityId === "number")
    return res.json({
      isSuccess: false,
      code: 400,
      message: "활동수준은 숫자만 입력해주세요.",
    });

  try {
    const [updateBasicInfoRow] = await userDao.updateBasicInfo(
        [weight, kidneyType, activityId],
        id
    );


    const [userRow] = await userDao.findUserByUserId(id);
    console.log(userRow);
    const [[activityRow]] = await userDao.selectActivity(activityId);
    console.log(activityRow.pa);
    const [kidneyTypeRows] = await userDao.selectKidney(kidneyType);
    let Mheight2 =  Mheight(userRow[0].height);
    let age2 =  age(userRow[0].birth);
    let activity = activityRow.pa;
    let kidney = kidneyTypeRows.protein;

      requiredCalorie = (userRow[0].gender === "M" ? Mcalorie(weight, age2, Mheight2, activity) : Fcalorie(weight, age2, Mheight2, activity));
      requiredPhosphorus = (kidneyType === 2 ? unomalPhosphorus(Mheight2) : nomalPhosphorus(age2));
      requiredProtein = (kidneyType === 7 ? unnomalprotein(userRow[0].gender, age2) : nomalprotein(userRow[0].gender, Mheight2, kidney));

          console.log("calorie : " + requiredCalorie);
          console.log("phosphrus : "  + requiredPhosphorus);
          console.log("protein : " + requiredProtein);

    const [chageBasicNutritionRow] = await userDao.chageBasicNutrition(
        [requiredCalorie, requiredPhosphorus, requiredProtein],
        id
    );

    if (updateBasicInfoRow.affectedRows && chageBasicNutritionRow.affectedRows) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "기본정보 변경 성공",
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "기본정보 변경 실패",
      });
    }
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.getMyInfo = async function (req, res) {
  const { id } = req.verifiedToken;

  console.log(id);
  console.log({ id });

  try {
    const [userRow] = await userDao.findUserByUserId(id);
    const [nutritionRow] = await userDao.findNutiritionByID(id);
    console.log(userRow);
    console.log(nutritionRow);
    if (userRow) {

      return res.json({
        isSuccess: true,
        code: 200,
        message: "유저정보 가져오기 성공",
        isKakaoUser: userRow[0].kakaoId ? true : false,
        userInfo: {
          id: userRow[0].userId,
          email: userRow[0].email,
          nickname: userRow[0].nickname,
          kidneyType: userRow[0].kidneyDiseaseTypeId,
          age:
            new Date().getFullYear() - new Date(userRow[0].birth).getFullYear(),
          gender: userRow[0].gender,
          height: userRow[0].height,
          weight: userRow[0].weight,
          activityId: userRow[0].activityId,
          profileImageUrl: userRow[0].profileImageUrl,
          goal: {
            protein: nutritionRow[0].requiredProtein,
            potassium: nutritionRow[0].requiredPotassium,
            sodium: nutritionRow[0].requiredSodium,
            phosphorus: nutritionRow[0].requiredPhosphorus,
            calorie: nutritionRow[0].requiredCalorie,
          },
        },
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "유저정보 가져오기 실패",
      });
    }
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

//changeNutrition API
exports.changeBasicNutrition = async function (req, res) {
  const {
    body: { calorie, protein, phosphorus, potassium, sodium },
    verifiedToken: { id },
  } = req;

  console.log(req.body);
  
  try {
    const [updateBasicNutritionRow] = await userDao.updateBasicNutrition(
      [calorie, protein, phosphorus, potassium, sodium],
      id
    );


    if (updateBasicNutritionRow.affectedRows) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "영양소 변경 성공",
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "영양소 변경 실패",
      });
    }
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
