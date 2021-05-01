const { json } = require("express");
const { logger } = require("../../../config/winston");
const foodDao = require("../dao/foodDao");

exports.findFoods = async function (req, res) {
  const {
    query: { foodName },
    verifiedToken: { id },
  } = req;

  if (!foodName) return res.json({
    isSuccess: false,
    code: 400,
    message: "검색할 음식 이름을 적어주세요",
  });

  try {
    const foodIngredientRows = await foodDao.selectFoodByName(foodName, id);

    if (foodIngredientRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "음식 정보 가져오기 성공",
        foods: foodIngredientRows,
        searchQuery: foodName
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "음식 정보 가져오기 실패 (음식 검색결과가 없습니다)",
      });
    }
  } catch (err) {
    logger.error(`App - findFood Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

const convertMealTime = {
  1: 'breakfast',
  2: 'lunch',
  3: 'dinner',
  4: 'snack',
}

exports.getFoodRecord = async function (req, res) {
  const {
    verifiedToken: { id },
  } = req;

  try {
    const foodRecordRows = await foodDao.getFoodRecord(id);

    console.log(foodRecordRows);

    let diet = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const foodRecord of foodRecordRows) {
      diet[convertMealTime[foodRecord.foodIntakeRecordTypeId]].push(foodRecord);
    }

    console.log(diet);
    if (foodRecordRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "식사 정보 가져오기 성공",
        diet
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "식사 정보 가져오기 실패 (식사 검색결과가 없습니다)",
      });
    }
  } catch (err) {
    logger.error(`App - getFoodRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// foodRecord 날짜 별 가져오기
exports.getFoodRecordWithDate = async function (req, res) {
  console.log("getFoodRecordWithDate 들어옴");

  const {
    body: { date },
    verifiedToken: { id },
  } = req;

  console.log(date)

  try {
    console.log("1");
    const foodRecordRows = await foodDao.getFoodRecordWithDate(id, date);
    console.log("4");
    console.log(foodRecordRows);


    let diet = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const foodRecord of foodRecordRows) {
      diet[convertMealTime[foodRecord.foodIntakeRecordTypeId]].push(foodRecord);
    }

    if (foodRecordRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "식사 정보 가져오기 성공",
        diet
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "식사 정보 가져오기 실패 (식사 검색결과가 없습니다)",
      });
    }
  } catch (err) {
    console.log("2");
    logger.error(`App - getFoodRecordWithDate Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// nutrition 계산 후 가져오기
exports.getNutrition = async function (req, res) {
  const {
    verifiedToken: { id },
  } = req;

  try {
    console.log("들어왔어요~~");
    const nutritionRows = await foodDao.getNutrition(id);
    console.log("nutritionRow : ")
    console.log(nutritionRows.length);
    let calorie = 0;
    let protein = 0;
    let phosphorus = 0;
    let potassium = 0;
    let sodium = 0;

    let i = 0;
    while (i < nutritionRows.length) {
      calorie += nutritionRows[i].calorie;
      protein += nutritionRows[i].protein;
      phosphorus += nutritionRows[i].phosphorus;
      potassium += nutritionRows[i].potassium;
      sodium += nutritionRows[i].sodium
      console.log(nutritionRows[i]);
      i++;
    }

    console.log("칼로리 : ")
    console.log(calorie);

    let nutrition = {
      caloire: calorie,
      protein: protein,
      phosphorus: phosphorus,
      potassium: potassium,
      sodium: sodium,
    };
    console.log("")
    console.log(nutrition);


    if (nutritionRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "영양소 정보 가져오기 성공",
        nutrition
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "영양소 정보가 없습니다.",
        nutrition
      });
    }
  } catch (err) {
    console.log("2");
    logger.error(`App - getNutrition Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }

}

exports.saveFoodRecord = async function (req, res) {
  const {
    body: { foodIntakeRecordType, basketFoods },
    verifiedToken: { id },
  } = req;

  console.log(foodIntakeRecordType, basketFoods);
  console.log(id);

  if (!foodIntakeRecordType || !basketFoods.length) return res.json({
    isSuccess: false,
    code: 400,
    message: "식사 시기 또는 음식 정보가 누락되었습니다.",
  });

  try {

    const result = await foodDao.insertFoodIntakeRecord(foodIntakeRecordType, basketFoods, id);

    console.log('insertResult', result);

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
    logger.error(`App - saveFoodRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}

exports.removeFoodRecord = async function (req, res) {
  const {
    query: { foodIntakeRecordTypeId, foodId, date },
    verifiedToken: { id },
  } = req;

  if (!foodIntakeRecordTypeId || !foodId || !date) return res.json({
    isSuccess: false,
    code: 400,
    message: "식사 시기 또는 음식 정보가 누락되었습니다.",
  });

  try {
    const result = await foodDao.removeFoodIntakeRecordSub(foodIntakeRecordTypeId, foodId, id, date);

    if (result) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "음식 삭제 성공",
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "음식 삭제 실패",
      });
    }

  } catch (err) {
    logger.error(`App - removeFoodRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}

exports.removeFoodRecordsByMealTime = async function (req, res) {
  const {
    params: { foodIntakeRecordId },
    // verifiedToken: { id },
  } = req;

  if (!foodIntakeRecordId) return res.json({
    isSuccess: false,
    code: 400,
    message: "식단 아이디가 누락되었습니다.",
  });

  try {
    const result = await foodDao.removeFoodRecordsByMealTime(foodIntakeRecordId);
    console.log(result);

    if (result) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "식단 삭제 성공",
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "식단 삭제 실패",
      });
    }

  } catch (err) {
    logger.error(`App - removeFoodRecordsByMealTime Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}

exports.getFoodCategory = async function (req, res) {
  try {
    const foodCategoryRows = await foodDao.selectFoodCategory();

    if (foodCategoryRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "음식 카테고리 정보 가져오기 성공",
        foodCategories: foodCategoryRows.map(row => row.category),
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "음식 카테고리 정보 가져오기 실패 (음식 검색결과가 없습니다)",
      });
    }
  } catch (err) {
    logger.error(`App - getFoodCategory Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}

exports.findFoodsByCategory = async function (req, res) {
  const {
    query: { category },
    verifiedToken: { id },
  } = req;

  if (!category) return res.json({
    isSuccess: false,
    code: 400,
    message: "검색할 음식 카테고리 이름을 적어주세요",
  });

  try {
    const foodIngredientRows = await foodDao.selectFoodByCategory(category, id);

    if (foodIngredientRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "카테고리 별 음식 정보 가져오기 성공",
        foods: foodIngredientRows,
        searchCategory: category
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "카테고리 별 음식 정보 가져오기 실패 (음식 검색결과가 없습니다)",
      });
    }
  } catch (err) {
    logger.error(`App - findFoodsByCategory Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}