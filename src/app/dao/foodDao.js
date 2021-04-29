const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");

exports.findByFoodName = async function (foodName, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const findByFoodNameQuery = `
    SELECT *
    FROM food
    WHERE foodName like concat('%', ?, '%') ;
  `;
  const findByFoodNameParams = [foodName];
  const [foodIngredientRows] = await connection.query(
    findByFoodNameQuery,
    findByFoodNameParams
  );


  // 해당 유저가 이미 섭취한 음식이 있는지 검색하여 구분
  const findDuplicatedFoodQuery = `
    SELECT foodId, fir.foodIntakeRecordTypeId
    FROM foodIntakeRecord fir
            JOIN foodIntakeRecordSub firs ON fir.foodIntakeRecordId = firs.foodIntakeRecordId AND
                                              fir.foodIntakeRecordTypeId = firs.foodIntakeRecordTypeId
            JOIN user u ON fir.userId = u.userId
    WHERE u.userId = ?
      and foodId = ?
      and date(fir.createdAt) = date(now());
  `;

  for (const foodIngredient of foodIngredientRows) {
    const [findDuplicatedFoodRows] = await connection.query(
      findDuplicatedFoodQuery,
      [userId, foodIngredient.foodId]
    );

    if (findDuplicatedFoodRows.length) {
      foodIngredient['isAlreadyEat'] = true;
      foodIngredient['mealTime'] = findDuplicatedFoodRows[0].foodIntakeRecordTypeId;
    }
  }

  connection.release();

  return foodIngredientRows;
}

exports.getFoodRecord = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getFoodRecordQuery = `
    SELECT fir.foodIntakeRecordId, fir.foodIntakeRecordTypeId, f.*
    FROM foodIntakeRecord fir
            JOIN foodIntakeRecordSub firs
                  ON fir.foodIntakeRecordId = firs.foodIntakeRecordId AND
                    fir.foodIntakeRecordTypeId = firs.foodIntakeRecordTypeId
            JOIN food f ON firs.foodId = f.foodId
    WHERE fir.userId = ?
      AND date(createdAt) = date(now());
  `;

  const getFoodRecordParams = [userId];
  const [foodRecordRows] = await connection.query(
    getFoodRecordQuery,
    getFoodRecordParams
  );
  connection.release();

  console.log(foodRecordRows);

  return foodRecordRows;
}

//날짜 별 foodRecord 조회
exports.getFoodRecordWithDate = async function (id, date) {
  const connection = await pool.getConnection(async (conn) => conn);
  console.log("3");
  console.log(id + " : " + date);
  try {
    const getFoodRecordWithDateQuery = `
   SELECT fir.foodIntakeRecordId, fir.foodIntakeRecordTypeId, f.*
    FROM foodIntakeRecord fir
            JOIN foodIntakeRecordSub firs
                  ON fir.foodIntakeRecordId = firs.foodIntakeRecordId AND
                    fir.foodIntakeRecordTypeId = firs.foodIntakeRecordTypeId
            JOIN food f ON firs.foodId = f.foodId
    WHERE fir.userId = ?
      AND date(createdAt) = date(concat('', ?));
  `;

    const getFoodRecordWithDateParams = [id, date];
    const [foodRecordWithDateRows] = await connection.query(
      getFoodRecordWithDateQuery,
      getFoodRecordWithDateParams
    );

    connection.release()
    return foodRecordWithDateRows;
  }
  catch (err) {
    console.log("err");
    console.log(err);

  }



}

// 날짜 별 영양소 조회
exports.getNutrition = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);


  const getNutritionQuery = `
   SELECT f.calorie, f.protein, f.phosphorus, f.sodium, f.potassium
    FROM foodIntakeRecord fir
            JOIN foodIntakeRecordSub firs
                  ON fir.foodIntakeRecordId = firs.foodIntakeRecordId AND
                    fir.foodIntakeRecordTypeId = firs.foodIntakeRecordTypeId
            JOIN food f ON firs.foodId = f.foodId
    WHERE fir.userId = ?
      AND date(createdAt) = date(now());
  `;
  const getNutritionParams = [id];
  const [NutritionRows] = await connection.query(
    getNutritionQuery,
    getNutritionParams
  );
  connection.release();

  console.log("영양소 계산 db 들어 왔어요~")
  console.log(NutritionRows)
  return NutritionRows;

}

exports.insertFoodIntakeRecord = async function (foodIntakeRecordTypeId, basketFoods, userId) {
  const connection = await pool.getConnection(async (conn) => conn);

  console.log('foodIntakeRecordTypeId, basketFoods, userId', foodIntakeRecordTypeId, basketFoods, userId);

  if (!(foodIntakeRecordTypeId && basketFoods && userId)) throw new Error('누락된 정보가 있습니다.');

  try {

    await connection.beginTransaction(); // START TRANSACTION

    // 오늘 추가된 FoodIntakeRecord header가 있는지 확인
    const isExistFoodIntakeRecordQuery = `
      SELECT foodIntakeRecordId
      FROM foodIntakeRecord
      WHERE date(createdAt) = date(now())
        AND foodIntakeRecordTypeId = ?
        AND userId = ?;
    `;

    const isExistFoodIntakeRecordParams = [foodIntakeRecordTypeId, userId];
    let [isExistFoodIntakeRecordRows] = await connection.query(
      isExistFoodIntakeRecordQuery,
      isExistFoodIntakeRecordParams
    );

    console.log('isExistFoodIntakeRecordRows', isExistFoodIntakeRecordRows);

    let foodIntakeRecordId = isExistFoodIntakeRecordRows[0] ? isExistFoodIntakeRecordRows[0].foodIntakeRecordId : undefined;


    // 오늘 추가된 FoodIntakeRecord header가 없으면 header를 추가해줌
    if (!isExistFoodIntakeRecordRows.length) {
      // foodIntakeRecord
      const insertFoodIntakeRecordQuery = `
        INSERT INTO foodIntakeRecord (foodIntakeRecordTypeId, userId) 
        VALUES (?, ?);
      `;
      const insertFoodIntakeRecordParams = [foodIntakeRecordTypeId, userId];
      const [insertFoodIntakeRecordResult] = await connection.query(
        insertFoodIntakeRecordQuery,
        insertFoodIntakeRecordParams
      );

      foodIntakeRecordId = insertFoodIntakeRecordResult.insertId;
    }

    // 생성된 header의 id를 가지고 detail 정보를 생성, 단 food가 중복되면 에러 발생시킴
    // foodIntakeRecordSub
    const insertFoodIntakeRecordSubQuery = `
      INSERT INTO foodIntakeRecordSub (foodIntakeRecordId, foodIntakeRecordTypeId, foodId, 
                                       foodAmount, calorie, protein,
                                       phosphorus, potassium, sodium)
      VALUES (?, ?, ?,
              ?, ?, ?,
              ?, ?, ?);
    `;

    const isExistFoodQuery = `
      SELECT foodId
      FROM foodIntakeRecordSub
      WHERE foodIntakeRecordId = ?
        AND foodIntakeRecordTypeId = ?
        AND foodId = ?;
    `;

    for (const basketFood of basketFoods) {
      const { foodId, foodAmount, calorie, protein, phosphorus, potassium, sodium } = basketFood;

      const isExistFoodParams = [foodIntakeRecordId, foodIntakeRecordTypeId, foodId];
      const [isExistFoodResult] = await connection.query(
        isExistFoodQuery,
        isExistFoodParams
      );

      console.log(isExistFoodResult, isExistFoodResult.length, foodIntakeRecordId, foodIntakeRecordTypeId, foodId);

      if (isExistFoodResult.length) {
        throw new Error('이미 추가된 음식입니다.');
      }

      const insertFoodIntakeRecordSubParams = [foodIntakeRecordId, foodIntakeRecordTypeId, foodId, +foodAmount, calorie, protein, phosphorus, potassium, sodium];
      await connection.query(insertFoodIntakeRecordSubQuery, insertFoodIntakeRecordSubParams);
    }

    await connection.commit(); // COMMIT
    connection.release();

    return true;
  } catch (err) {
    console.log('err', err);
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertFoodIntakeRecord Query error\n: ${err.message}`);

    return false;
  }
}

exports.removeFoodRecordsByMealTime = async function (foodIntakeRecordId) {
  const connection = await pool.getConnection(async (conn) => conn);

  const removeFoodRecordsByMealTimeQuery = `
    DELETE FROM foodIntakeRecordSub 
    WHERE foodIntakeRecordId = ?;
  `;

  const removeFoodRecordsByMealTimeParams = [foodIntakeRecordId];
  const [removeFoodRecordsByMealTimeResult] = await connection.query(
    removeFoodRecordsByMealTimeQuery,
    removeFoodRecordsByMealTimeParams
  );

  connection.release();

  return removeFoodRecordsByMealTimeResult;
}
exports.removeFoodIntakeRecordSub = async function (foodIntakeRecordTypeId, foodId, userId, date) {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    await connection.beginTransaction(); // START TRANSACTION

    const getFoodIntakeRecordIdQuery = `
      SELECT foodIntakeRecordId 
      FROM foodIntakeRecord WHERE foodIntakeRecordTypeId = ? AND userId = ? AND date(createdAt) = date(concat('', ?));
    `;

    const getFoodIntakeRecordIdParams = [foodIntakeRecordTypeId, userId, date];
    const [foodIntakeRecordRow] = await connection.query(
      getFoodIntakeRecordIdQuery,
      getFoodIntakeRecordIdParams
    );

    if (foodIntakeRecordRow.length) {
      const removeFoodIntakeRecordSubQuery = `
        DELETE FROM foodIntakeRecordSub 
        WHERE foodIntakeRecordId = ? AND foodIntakeRecordTypeId = ? AND foodId = ?;
      `;

      const removeFoodIntakeRecordSubParams = [foodIntakeRecordRow[0].foodIntakeRecordId, foodIntakeRecordTypeId, foodId];
      const [removeFoodIntakeRecordSubResult] = await connection.query(
        removeFoodIntakeRecordSubQuery,
        removeFoodIntakeRecordSubParams
      );

      if (removeFoodIntakeRecordSubResult.affectedRows < 1) throw new Error('삭제할 음식이 존재하지 않습니다.');
    }


    await connection.commit(); // COMMIT
    connection.release();

    return true;

  } catch (err) {
    console.log('err', err);

    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - removeFoodIntakeRecordSub Query error\n: ${err.message}`);

    return false;
  }
}

exports.selectFoodCategory = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFoodCategoryQuery = `
    SELECT category
    FROM food
    WHERE foodType = 2
    GROUP BY category;
  `;

  const [foodCategoryRows] = await connection.query(selectFoodCategoryQuery);

  connection.release();

  return foodCategoryRows;
}