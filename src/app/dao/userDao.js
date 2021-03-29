const { pool } = require("../../../config/database");

// Signup
async function userEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
                SELECT email, nickname 
                FROM user 
                WHERE email = ?;
                `;
  const selectEmailParams = [email];
  const [emailRows] = await connection.query(
    selectEmailQuery,
    selectEmailParams
  );
  connection.release();

  return emailRows;
}

async function userNicknameCheck(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectNicknameQuery = `
                SELECT email, nickname 
                FROM user 
                WHERE nickname = ?;
                `;
  const selectNicknameParams = [nickname];
  const [nicknameRows] = await connection.query(
    selectNicknameQuery,
    selectNicknameParams
  );
  connection.release();
  return nicknameRows;
}

async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoQuery = `
        INSERT INTO user (email, pw, nickname, height, weight, gender, kidneyDiseaseTypeId, birth, activityId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );
  connection.release();
  return insertUserInfoRow;
}

async function insertuserRequiredNuturition(userRequiredNuturitionParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userRequiredNuturitionQuery = `
        INSERT into userRequiredNuturition (requiredCalorie, requiredPhosphorus, requiredSodium, requiredPotassium, requiredProtein)
        VALUES (?, ?, ?, ?, ?);
    `;
  const userRequiredNuturitionRow = await connection.query(
    userRequiredNuturitionQuery,
    userRequiredNuturitionParams
  );
  connection.release();
  return userRequiredNuturitionRow;
}

async function selectActivity(activityId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectActivityQuery = `
      SELECT *
      FROM activity
      WHERE activityId = ?;
      `;

  let selectActivityParams = [activityId];
  const [activityRows] = await connection.query(
    selectActivityQuery,
    selectActivityParams
  );
  return [activityRows];
}

async function selectKidney(kidneyType) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectKidneyQuery = `
      SELECT *
      FROM kidneyType
      WHERE kidneyId = ?;
      `;

  let selectKidneyParams = [kidneyType];
  const [kidneyTypeRows] = await connection.query(
    selectKidneyQuery,
    selectKidneyParams
  );
  return kidneyTypeRows;
}

//SignIn
async function selectUserInfo(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
                SELECT *
                FROM user
                WHERE email = ?;
                `;

  let selectUserInfoParams = [email];
  const [userInfoRows] = await connection.query(
    selectUserInfoQuery,
    selectUserInfoParams
  );
  return [userInfoRows];
}

async function findUserById(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const findUserByIdQuery = `
    SELECT *
    FROM user
    WHERE email = ?;
  `;
  let findUserByIdParams = [id];
  const [findUserByIdRows] = await connection.query(
    findUserByIdQuery,
    findUserByIdParams
  );

  return [findUserByIdRows];
}

// nutrition
async function findNutiritionByID(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const findNutiritionByIDQuery = `
    SELECT *
    FROM userRequiredNuturition
    WHERE userId = ?;
  `;

  let findNutiritionByIdParmas = [id];
  const [findNutiritionByIDRows] = await connection.query(
    findNutiritionByIDQuery,
    findNutiritionByIdParmas
  );

  return [findNutiritionByIDRows];
}

async function updateUserName(id, name) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateUserNameQuery = `
        UPDATE user SET name = ?
        WHERE userID = ?
  `;
  const updateUserNameRow = await connection.query(updateUserNameQuery, [
    name,
    id,
  ]);
  connection.release();

  connection.log(updateUserNameRow);
  return updateUserNameRow;
}

async function findUserByKakaoId(kakaoId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userInfoQuery = `
                SELECT *
                FROM user
                WHERE kakaoId = ?;
                `;

  let userInfoParams = [kakaoId];
  const [userInfoRows] = await connection.query(userInfoQuery, userInfoParams);
  return [userInfoRows];
}

async function insertKakaoUser(email, nickname, profileImageUrl, kakaoId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertUserInfoByKakaoIdQuery = `
        INSERT INTO user (email, nickname, profileImageUrl, kakaoId)
        VALUES (?, ?, ?, ?);
    `;
  const insertUserInfoByKakaoIdRow = await connection.query(
    insertUserInfoByKakaoIdQuery,
    [email, nickname, profileImageUrl, kakaoId]
  );
  connection.release();
  return insertUserInfoByKakaoIdRow;
}

async function updateKakaoUserInfo(updateKakaoUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateKakaoUserInfoQuery = `
        UPDATE user SET height = ?, weight = ?, gender = ?, kidneyDiseaseTypeId = ?, birth = ?, activityId = ?
        WHERE userId = ?
    `;
  const updateKakaoUserInfoRow = await connection.query(
    updateKakaoUserInfoQuery,
    updateKakaoUserInfoParams
  );
  connection.release();
  return updateKakaoUserInfoRow;
}

async function findUserByUserId(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const findUserByIdQuery = `
      SELECT *
      FROM user
      WHERE userId = ?;
    `;
  let findUserByIdParams = [id];
  const [findUserByIdRows] = await connection.query(
    findUserByIdQuery,
    findUserByIdParams
  );

  return [findUserByIdRows];
}

async function updatePassword(newPassword, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updatePasswordQuery = `
        UPDATE user SET pw = ?
        WHERE userId = ?
    `;
  const updatePasswordRow = await connection.query(updatePasswordQuery, [
    newPassword,
    id,
  ]);
  connection.release();
  return updatePasswordRow;
}

async function updateWeight(newWeight, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateWeightQuery = `
        UPDATE user SET weight = ?
        WHERE userId = ?
    `;
  const updateWeightRow = await connection.query(updateWeightQuery, [
    newWeight,
    id,
  ]);
  connection.release();
  return updateWeightRow;
}

async function updateKidneyType(newKidneyType, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateKidneyTypeQuery = `
        UPDATE user SET kidneyDiseaseTypeId = ?
        WHERE userId = ?
    `;
  const updateKidneyTypeRow = await connection.query(updateKidneyTypeQuery, [
    newKidneyType,
    id,
  ]);
  connection.release();
  return updateKidneyTypeRow;
}

async function updateActivityId(newActivityId, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateActivityIdQuery = `
        UPDATE user SET activityId = ?
        WHERE userId = ?
    `;
  const updateActivityIdRow = await connection.query(updateActivityIdQuery, [
    newActivityId,
    id,
  ]);
  connection.release();
  return updateActivityIdRow;
}

async function updateBasicInfo(basicInfoParams, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateBasicInfoQuery = `
        UPDATE user SET weight = ?, kidneyDiseaseTypeId = ?, activityId = ?
        WHERE userId = ?
    `;
  const updateBasicInfoRow = await connection.query(updateBasicInfoQuery, [
    ...basicInfoParams,
    id,
  ]);
  connection.release();
  return updateBasicInfoRow;
}

async function chageBasicNutrition(basicNutritionParams, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const chageBasicNutritionQuery = `
        UPDATE userRequiredNuturition SET requiredCalorie = ?, requiredPhosphorus = ?, requiredProtein = ? 
        WHERE userId = ?
    `;
  const chageBasicNutritionRow = await connection.query(
      chageBasicNutritionQuery,
      [...basicNutritionParams, id]
  );
  connection.release();
  return chageBasicNutritionRow;
}

// update nutrition

async function updateBasicNutrition(basicNutritionParams, id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const updateBasicNutritionQuery = `
        UPDATE userRequiredNuturition SET requiredCalorie = ?, requiredPhosphorus = ?, requiredSodium = ?, requiredPotassium = ?, requiredProtein = ? 
        WHERE userId = ?
    `;
  const updateBasicNutritionRow = await connection.query(
    updateBasicNutritionQuery,
    [...basicNutritionParams, id]
  );
  connection.release();
  return updateBasicNutritionRow;
}

module.exports = {
  userEmailCheck,
  userNicknameCheck,
  insertUserInfo,
  selectUserInfo,
  findUserById,
  findUserByKakaoId,
  insertKakaoUser,
  updateKakaoUserInfo,
  findUserByUserId,
  updatePassword,
  updateWeight,
  updateKidneyType,
  updateActivityId,
  updateBasicInfo,
  selectActivity,
  selectKidney,
  insertuserRequiredNuturition,
  findNutiritionByID,
  updateBasicNutrition,
  chageBasicNutrition,
};
