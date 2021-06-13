const dietDao = require("../dao/dietDao");

exports.saveDiet = async function (req, res) {
  const {
    body: { recommendDiets },
  } = req;

  try {
    const [isSuccess, message] = await dietDao.insertDiet({ recommendDiets });

    if (isSuccess) {
      res.json({
        isSuccess: true,
        code: 200,
        message,
      });
    } else {
      res.json({
        isSuccess: false,
        code: 400,
        message,
      });
    }
  } catch (err) {
    // res.status(500).send('서버 에러');
    res.json({
      code: 500,
      isSuccess: false,
      message: "서버 오류로 인해 투석일지 저장에 실패했습니다.",
    });
    console.log("saveDiet Error", err);
  }
};
const convertMealTime = {
  1: "breakfast",
  2: "lunch",
  3: "dinner",
  4: "snack",
};

exports.getDites = async function (req, res) {
  const {
    query: { kidneyType, gender },
  } = req;

  console.log("saveDiet 들어옴");
  console.log(kidneyType, gender);
  try {
    const dietRows = await dietDao.getDiets(kidneyType, gender);

    let diet = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const key of dietRows) {
      diet[convertMealTime[key.foodIntakeRecordTypeId]].push(key);
    }

    console.log(diet);
    if (dietRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "식사 저장 정보 가져오기 성공",
        diet,
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "식사 저장 정보 가져오기 성공(저장된 식사정보가 없습니다.)",
      });
    }
  } catch (err) {
    logger.error(`App- getStoredRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
