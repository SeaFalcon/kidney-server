const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");

const foodIntakeRecordType = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
};

exports.insertDiet = async function ({ recommendDiets }) {
  const connection = await pool.getConnection(async (conn) => conn);

  // if (!(recordDate || memo)) throw new Error('누락된 정보가 있습니다.')

  try {
    await connection.beginTransaction(); // START TRANSACTION

    for (recommendDiet of recommendDiets) {
      const { kidneyId, gender, name, diets } = recommendDiet;

      for (diet of diets) {
        const { breakfast, lunch, dinner, snack } = diet;

        const insertDietHeaderQuery = `
        INSERT INTO dietHeader (kidneyId, gender) VALUES (?, ?);
      `;

        const insertDietHeaderParams = [kidneyId, gender];
        let [insertDietHeaderRows] = await connection.query(
          insertDietHeaderQuery,
          insertDietHeaderParams
        );

        let dietHeaderId;
        if (insertDietHeaderRows) dietHeaderId = insertDietHeaderRows.insertId;

        const insertDietDetailQuery = `
        INSERT INTO dietDetail (foodId, foodAmount, foodIntakeRecordTypeId, dietId) 
        VALUES (?, ?, ?, ?);
      `;

        const findFoodIdQuery = `
        SELECT foodId FROM food WHERE foodName = ?;
      `;

        // breakfast
        for ({ foodName, amount } of breakfast) {
          const findFoodIdParams = [foodName];
          const [findFoodIdRows] = await connection.query(
            findFoodIdQuery,
            findFoodIdParams
          );

          if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
          const foodId = findFoodIdRows[0].foodId;

          const insertDietDetailParams = [
            foodId,
            amount,
            foodIntakeRecordType["breakfast"],
            dietHeaderId,
          ];
          const [insertDietDetailRows] = await connection.query(
            insertDietDetailQuery,
            insertDietDetailParams
          );
        }

        // lunch
        for ({ foodName, amount } of lunch) {
          const findFoodIdParams = [foodName];
          const [findFoodIdRows] = await connection.query(
            findFoodIdQuery,
            findFoodIdParams
          );

          if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
          const foodId = findFoodIdRows[0].foodId;

          const insertDietDetailParams = [
            foodId,
            amount,
            foodIntakeRecordType["lunch"],
            dietHeaderId,
          ];
          const [insertDietDetailRows] = await connection.query(
            insertDietDetailQuery,
            insertDietDetailParams
          );
        }

        // dinner
        for ({ foodName, amount } of dinner) {
          const findFoodIdParams = [foodName];
          const [findFoodIdRows] = await connection.query(
            findFoodIdQuery,
            findFoodIdParams
          );

          if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
          const foodId = findFoodIdRows[0].foodId;

          const insertDietDetailParams = [
            foodId,
            amount,
            foodIntakeRecordType["dinner"],
            dietHeaderId,
          ];
          const [insertDietDetailRows] = await connection.query(
            insertDietDetailQuery,
            insertDietDetailParams
          );
        }

        // snack
        if (snack.length) {
          for ({ foodName, amount } of snack) {
            const findFoodIdParams = [foodName];
            const [findFoodIdRows] = await connection.query(
              findFoodIdQuery,
              findFoodIdParams
            );

            if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
            const foodId = findFoodIdRows[0].foodId;

            const insertDietDetailParams = [
              foodId,
              amount,
              foodIntakeRecordType["snack"],
              dietHeaderId,
            ];
            const [insertDietDetailRows] = await connection.query(
              insertDietDetailQuery,
              insertDietDetailParams
            );
          }
        }
      }
    }

    await connection.commit(); // COMMIT
    connection.release();

    return [true, "추천 식단 저장에 성공했습니다."];
  } catch (err) {
    console.log("err", err);
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertDiet Query error\n: ${err.message}`);

    return [false, err.message];
  }
};

exports.getDiets = async function (kidneyType, gender) {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    await connection.beginTransaction(); // START TRANSACTION

    const isExistFoodIntakeRecordQuery = `
    SELECT dietId
    FROM dietheader
    WHERE kidneyId=? AND gender=?;
    `;

    const isExistFoodIntakeRecordParams = [kidneyType, gender];
    let [isExistFoodIntakeRecordRows] = await connection.query(
      isExistFoodIntakeRecordQuery,
      isExistFoodIntakeRecordParams
    );

    const getDitesQuery = `
    SELECT dt.foodAmount AS customAmount, dt.foodIntakeRecordTypeId, f.*
        FROM dietdetail dt
                JOIN food f ON dt.foodId = f.foodId
        WHERE dt.dietId = ?;
      `;

    let num = Math.floor(Math.random() * isExistFoodIntakeRecordRows.length);
    console.log(num);
    const getDietsParams = [isExistFoodIntakeRecordRows[num].dietId];
    const [DietsRow] = await connection.query(getDitesQuery, getDietsParams);

    // console.log("dietRow 1");
    // console.log(DietsRow[1].foodId);

    // let param = [];

    // for (let i = 0; i < DietsRow.length; i++) {
    //   param.push(DietsRow[i].foodId);
    // }

    // param = new Set(param);

    // const RecipeRows2 = [];
    // for (let i of param) {
    //   const getRecipeQuery = `

    //   SELECT *
    //   FROM dremchan.foodrecipe
    //   WHERE parentFoodId IN(?);
    //     `;

    //   const [RecipeRows] = await connection.query(getRecipeQuery, i);
    //   RecipeRows2.push(RecipeRows);
    // }

    //console.log(RecipeRows2);

    await connection.commit(); // COMMIT
    connection.release;

    return DietsRow;
  } catch (err) {
    console.log("err", err);
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertFoodIntakeRecord Query error\n: ${err.message}`);
  }
};

exports.getAllDiet = async function (kidneyType, gender) {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    await connection.beginTransaction(); // START TRANSACTION
    const getDietsQuery = `
    select dt.dietId, dt.foodId, dt.foodIntakeRecordTypeId, f.foodName
    from dremchan.dietheader dh
    Join dremchan.dietdetail dt ON dt.dietId = dh.dietId
    Join food f on 
    dt.foodId = f.foodId
    where dh.kidneyId=? and dh.gender=?;
    
  `;

    const getDietsParams = [kidneyType, gender];
    const [AllDietsRow] = await connection.query(getDietsQuery, getDietsParams);

    await connection.commit();
    connection.release;

    return AllDietsRow;
  } catch (err) {
    console.log("err", err);
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertFoodIntakeRecord Query error\n: ${err.message}`);
  }
};

exports.getRecipe = async function (parentFoodId) {
  const connection = await pool.getConnection(async (conn) => conn);

  const getRecipeQuery = `
  SELECT * 
  FROM foodrecipe
  WHERE parentFoodId=?;
  `;

  const [RecipeRows] = await connection.query(getRecipeQuery, parentFoodId);

  console.log("Recipe.dao 에서 레시피 가져왔당!");

  connection.release;
  return RecipeRows;
};
