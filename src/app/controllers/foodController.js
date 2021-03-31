const { logger } = require("../../../config/winston");
const foodDao = require("../dao/foodDao");

exports.findByFoodName = async function (req, res) {
  const {
    query: { foodName },
    // verifiedToken: { id },
  } = req;

  if (!foodName) return res.json({
    isSuccess: false,
    code: 400,
    message: "검색할 음식 이름을 적어주세요",
  });

  try {
    const foodIngredientRows = await foodDao.findByFoodName(foodName);

    if (foodIngredientRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "음식 정보 가져오기 성공",
        foods: foodIngredientRows
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "음식 정보 가져오기 실패 (음식 검색결과가 없습니다)",
      });
    }
  } catch (err) {
    logger.error(`App - findByFoodName Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.saveFoodRecord = async function (req, res) {
  const {
    body: { foodIntakeRecordType, foodIds },
    // verifiedToken: { id },
  } = req;

  console.log(foodIntakeRecordType, foodIds);

  if (!foodIntakeRecordType || !foodIds.length) return res.json({
    isSuccess: false,
    code: 400,
    message: "식사 시기 또는 음식 정보가 누락되었습니다.",
  });

  try {
    
    const result = await foodDao.insertFoodIntakeRecord(foodIntakeRecordType, foodIds, 1);
        
    if (result) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "식사정보 입력 성공",
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "식사정보 입력 실패",
      });
    }

  } catch (err) {
    logger.error(`App - findByFoodName Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}

exports.getFoodRecord = async function (req, res) {
  const {
    // verifiedToken: { id },
  } = req;

  try {
    const foodRecordRows = await foodDao.getFoodRecord(1);

    console.log(foodRecordRows);

    if (foodRecordRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "식사 정보 가져오기 성공",
        diet: foodRecordRows
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "식사 정보 가져오기 실패 (식사 검색결과가 없습니다)",
      });
    }
  } catch (err) {
    logger.error(`App - findByFoodName Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};