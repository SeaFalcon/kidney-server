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
    SELECT dt.foodAmount AS customAmount, dt.foodIntakeRecordTypeId, f.foodId, f.foodName,
    round((f.calorie/f.foodAmount)*dt.foodAmount, 3) AS calorie,
    round((f.carbohydrate/f.foodAmount)*dt.foodAmount, 3) AS carbohydrate,
    round((f.fat/f.foodAmount)*dt.foodAmount, 3) AS fat,
    round((f.sodium/f.foodAmount)*dt.foodAmount, 3) AS sodium,
    round((f.calcium/f.foodAmount)*dt.foodAmount, 3) AS calcium,
    round((f.protein/f.foodAmount)*dt.foodAmount, 3) AS protein,
    round((f.potassium/f.foodAmount)*dt.foodAmount, 3) AS potassium,
    round((f.iron/f.foodAmount)*dt.foodAmount, 3) AS iron,
    round((f.phosphorus/f.foodAmount)*dt.foodAmount, 3) AS phosphorus,
    round((f.sugars/f.foodAmount)*dt.foodAmount, 3) AS sugars,
    round((f.moisture/f.foodAmount)*dt.foodAmount, 3) AS moisture
        FROM dietdetail dt
                JOIN food f ON dt.foodId = f.foodId
        WHERE dt.dietId = ?;
      `;

    let num = Math.floor(
      Math.random() * (isExistFoodIntakeRecordRows.length + 1)
    );
    console.log(num);
    const getDietsParams = [isExistFoodIntakeRecordRows[num].dietId];
    const [DietsRow] = await connection.query(getDitesQuery, getDietsParams);

    console.log(DietsRow[0]);

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
