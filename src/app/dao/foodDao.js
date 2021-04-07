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

exports.getFoodRecord = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getFoodRecordQuery = `
    SELECT fir.foodIntakeRecordTypeId, f.*
    FROM foodIntakeRecord fir
            JOIN foodIntakeRecordSub firs
                  ON fir.foodIntakeRecordId = firs.foodIntakeRecordId AND
                    fir.foodIntakeRecordTypeId = firs.foodIntakeRecordTypeId
            JOIN food f ON firs.foodId = f.foodId
    WHERE fir.userId = 1
      AND date(createdAt) = date(now());
  `;

  const getFoodRecordParams = [id];
  const [foodRecordRows] = await connection.query(
    getFoodRecordQuery,
    getFoodRecordParams
  );
  connection.release();

  return foodRecordRows;
}

exports.insertFoodIntakeRecord = async function (foodIntakeRecordTypeId, foodIds, userId) {
  const connection = await pool.getConnection(async (conn) => conn);

  if (!(foodIntakeRecordTypeId && foodIds && userId)) return false;

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
      INSERT INTO foodIntakeRecordSub (foodIntakeRecordId, foodIntakeRecordTypeId, foodId)
      VALUES (?, ?, ?);
    `;

    const isExistFoodQuery = `
      SELECT foodId
      FROM foodIntakeRecordSub
      WHERE foodIntakeRecordId = ?
        AND foodIntakeRecordTypeId = ?
        AND foodId = ?;
    `;

    for (const foodId of foodIds) {
      const isExistFoodParams = [foodIntakeRecordId, foodIntakeRecordTypeId, foodId];
      const [isExistFoodResult] = await connection.query(
        isExistFoodQuery,
        isExistFoodParams
      );

      console.log(isExistFoodResult, isExistFoodResult.length, foodIntakeRecordId, foodIntakeRecordTypeId, foodId);

      if (isExistFoodResult.length) {
        throw new Error('이미 추가된 음식입니다.');
      }

      const insertFoodIntakeRecordSubParams = [foodIntakeRecordId, foodIntakeRecordTypeId, foodId];
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
    console.log(err);

    return false;
  }
}