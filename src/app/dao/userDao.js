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

async function findUserById(id){
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
async function updateUserName(id, name){
  const connection = await pool.getConnection(async (conn) => conn);
  const updateUserNameQuery = `
        UPDATE  user SET name = ?
        WHERE userID = ?
  `;
  const updateUserNameRow = await connection.query(
    updateUserNameQuery,
    [name, id]
  );
  connection.release();
  
  connection.log(updateUserNameRow);
  return updateUserNameRow;
}

module.exports = {
  userEmailCheck,
  userNicknameCheck,
  insertUserInfo,
  selectUserInfo,
  findUserById
};
