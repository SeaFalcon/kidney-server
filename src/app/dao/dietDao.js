const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");

const foodIntakeRecordType = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
}

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
          const [findFoodIdRows] = await connection.query(findFoodIdQuery, findFoodIdParams);

          if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
          const foodId = findFoodIdRows[0].foodId;

          const insertDietDetailParams = [foodId, amount, foodIntakeRecordType['breakfast'], dietHeaderId];
          const [insertDietDetailRows] = await connection.query(insertDietDetailQuery, insertDietDetailParams);
        };

        // lunch
        for ({ foodName, amount } of lunch) {
          const findFoodIdParams = [foodName];
          const [findFoodIdRows] = await connection.query(findFoodIdQuery, findFoodIdParams);

          if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
          const foodId = findFoodIdRows[0].foodId;

          const insertDietDetailParams = [foodId, amount, foodIntakeRecordType['lunch'], dietHeaderId];
          const [insertDietDetailRows] = await connection.query(insertDietDetailQuery, insertDietDetailParams);
        };

        // dinner
        for ({ foodName, amount } of dinner) {
          const findFoodIdParams = [foodName];
          const [findFoodIdRows] = await connection.query(findFoodIdQuery, findFoodIdParams);

          if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
          const foodId = findFoodIdRows[0].foodId;

          const insertDietDetailParams = [foodId, amount, foodIntakeRecordType['dinner'], dietHeaderId];
          const [insertDietDetailRows] = await connection.query(insertDietDetailQuery, insertDietDetailParams);
        };

        // snack
        if (snack.length) {
          for ({ foodName, amount } of snack) {
            const findFoodIdParams = [foodName];
            const [findFoodIdRows] = await connection.query(findFoodIdQuery, findFoodIdParams);

            if (!findFoodIdRows.length) console.log(findFoodIdRows, foodName);
            const foodId = findFoodIdRows[0].foodId;

            const insertDietDetailParams = [foodId, amount, foodIntakeRecordType['snack'], dietHeaderId];
            const [insertDietDetailRows] = await connection.query(insertDietDetailQuery, insertDietDetailParams);
          };
        }
      }
    }

    await connection.commit(); // COMMIT
    connection.release();

    return [true, '추천 식단 저장에 성공했습니다.'];
  } catch (err) {
    console.log('err', err);
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertDiet Query error\n: ${err.message}`);

    return [false, err.message];
  }
}