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

  try {
    const dietRows = await dietDao.getDiets(kidneyType, gender);

    // let param = new Set();

    // for (let i = 0; i < dietRows.length; i++) {
    //   param.add(dietRows[i].foodId);
    // }

    // console.log("param : ", param);

    // let recipes = [];

    // for (let i of param) {
    //   const RecipeRows = await dietDao.getRecipe(i);
    //   recipes.push(RecipeRows);
    // }

    // console.log("recipes", recipes);

    let diet = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const key of dietRows) {
      diet[convertMealTime[key.foodIntakeRecordTypeId]].push(key);
    }

    // const recipeRows = await dietDao.getRecipe(param);

    // console.log(recipeRows);

    if (dietRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "추천 식단 가져오기 성공",
        diet,
        //recipes,
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "추천 식단 가져오기 성공(저장된 식사정보가 없습니다.)",
      });
    }
  } catch (err) {
    logger.error(`App- getStoredRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.getAllDiet = async function (req, res) {
  const {
    query: { kidneyType, gender },
  } = req;

  console.log("AllDiet 들어옴");

  try {
    const dietRows = await dietDao.getAllDiet(kidneyType, gender);

    console.log("Alldiet 가져옴");

    const my = {};

    for (
      let i = dietRows[0].dietId;
      i <= dietRows[dietRows.length - 1].dietId;
      i++
    ) {
      my[i] = {};
      my[i]["breakfast"] = [];
      my[i]["lunch"] = [];
      my[i]["dinner"] = [];
      my[i]["snack"] = [];
    }

    for (let i = 0; i < dietRows.length; i++) {
      for (let key of Object.keys(my)) {
        if (dietRows[i].dietId === Number(key)) {
          if (dietRows[i].foodIntakeRecordTypeId === 1) {
            my[key]["breakfast"].push(dietRows[i].foodName + ",  ");
          } else if (dietRows[i].foodIntakeRecordTypeId === 2) {
            my[key]["lunch"].push(dietRows[i].foodName + ",  ");
          } else if (dietRows[i].foodIntakeRecordTypeId === 3) {
            my[key]["dinner"].push(dietRows[i].foodName + ",  ");
          } else if (dietRows[i].foodIntakeRecordTypeId === 4) {
            my[key]["snack"].push(dietRows[i].foodName + ",  ");
          }
        }
      }
    }

    console.log(my["638"]);

    if (dietRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "추천 식단 가져오기 성공",
        diet: my,
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "추천 식단 가져오기 성공(저장된 식사정보가 없습니다.)",
      });
    }
  } catch (err) {
    logger.error(`App- getStoredRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.getRecipe = async function (req, res) {
  const {
    query: { parentFoodId },
  } = req;

  console.log("getRecipe 들어옴");

  try {
    const recipeRows = await dietDao.getRecipe(parentFoodId);

    console.log(recipeRows[0]);
    if (recipeRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "추천 식단 가져오기 성공",
        recipe: recipeRows,
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "추천 식단 가져오기 성공(저장된 식사정보가 없습니다.)",
      });
    }
  } catch (err) {
    logger.error(`App- getStoredRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

exports.getCertainDites = async function (req, res) {
  const {
    query: { key },
  } = req;

  try {
    const dietRows = await dietDao.getCertainDiet(key);

    let diet = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    for (const key of dietRows) {
      diet[convertMealTime[key.foodIntakeRecordTypeId]].push(key);
    }

    if (dietRows.length) {
      return res.json({
        isSuccess: true,
        code: 200,
        message: "추천 식단 가져오기 성공",
        diet,
      });
    } else {
      return res.json({
        isSuccess: false,
        code: 400,
        message: "추천 식단 가져오기 성공(저장된 식사정보가 없습니다.)",
      });
    }
  } catch (err) {
    logger.error(`App- getStoredRecord Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
