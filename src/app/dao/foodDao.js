const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");

exports.findByFoodName = async function (foodName) {
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
  connection.release();

  return foodIngredientRows;
}

exports.insertFoodIntakeRecord = async function (foodIntakeRecordTypeId, foodIds, userId) {
  const connection = await pool.getConnection(async (conn) => conn);

  if(!(foodIntakeRecordTypeId && foodIds && userId)) return false;

  try {

    await connection.beginTransaction(); // START TRANSACTION

    // foodIntakeRecord
    const insertFoodIntakeRecordQuery = `
      INSERT INTO foodIntakeRecord (foodIntakeRecordTypeId, userId) VALUES (?, ?);
    `;
    const insertFoodIntakeRecordParams = [foodIntakeRecordTypeId, userId];
    const [insertFoodIntakeRecordResult] = await connection.query(
      insertFoodIntakeRecordQuery,
      insertFoodIntakeRecordParams
    );

    const { insertId } = insertFoodIntakeRecordResult;

    // foodIntakeRecordSub
    const insertFoodIntakeRecordSubQuery = `
      INSERT INTO foodIntakeRecordSub (foodIntakeRecordId, foodIntakeRecordTypeId, foodId) VALUES (?, ?, ?);
    `;

    foodIds.forEach(async (foodId) => {
      const insertFoodIntakeRecordSubParams = [insertId, foodIntakeRecordTypeId, foodId];
      await connection.query(insertFoodIntakeRecordSubQuery, insertFoodIntakeRecordSubParams);
    });

    await connection.commit(); // COMMIT
    connection.release();

    return true;
  } catch (err) {
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertFoodIntakeRecord Query error\n: ${err.message}`);
    console.log(err);

    return false;
  }
}

exports.getFoodRecord = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getFoodRecordQuery = `
    SELECT fir.foodIntakeRecordId, fir.foodIntakeRecordTypeId, firs.foodId, f.foodName, fir.userId
    FROM foodintakerecord fir
            JOIN foodintakerecordsub firs
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