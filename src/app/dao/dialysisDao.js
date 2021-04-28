const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");

const dialysisTypes = {
  'MACHINE_DIALYSIS': 1, // 기계 복막투석
  'GENETAL_DIALYSIS': 2, // 일반 복막투석
  'HEMODIALYSIS': 3      // 혈액투석
}

exports.insertHemodialysisMemo = async function ({ imageUrl, recordDate, memo, userId }) {
  const connection = await pool.getConnection(async (conn) => conn);

  if (!(recordDate || memo)) throw new Error('누락된 정보가 있습니다.');

  try {
    await connection.beginTransaction(); // START TRANSACTION

    // 오늘 추가된 HemodialysisMemo 가 있는지 확인
    const isExistdialysisHeaderQuery = `
      SELECT dialysisId
      FROM dialysisHeader
      WHERE date(recordDate) = date(concat('', ?))
    `;

    const isExistdialysisHeaderParams = [recordDate];
    let [isExistdialysisHeaderRows] = await connection.query(
      isExistdialysisHeaderQuery,
      isExistdialysisHeaderParams
    );

    if (isExistdialysisHeaderRows.length) throw new Error('이미 투석일지 / 메모가 작성된 날입니다.');

    // foodIntakeRecord
    const insertDialysisHeaderQuery = `
        INSERT INTO dialysisHeader (userId, recordDate, dialysisTypeId) 
        VALUES (?, ?, ?);
      `;
    const insertDialysisHeaderParams = [userId, recordDate, dialysisTypes.HEMODIALYSIS];
    const [insertDialysisHeaderResult] = await connection.query(
      insertDialysisHeaderQuery,
      insertDialysisHeaderParams
    );

    const dialysisId = insertDialysisHeaderResult.insertId;

    // 생성된 header의 id를 가지고 detail 정보를 생성
    // dialysisDetail
    const insertDialysisDetailQuery = `
      INSERT INTO dialysisDetail (dialysisId, memo, photo)
      VALUES (?, ?, ?);
    `;

    const insertDialysisDetailParams = [dialysisId, memo, imageUrl];
    await connection.query(insertDialysisDetailQuery, insertDialysisDetailParams);

    await connection.commit(); // COMMIT
    connection.release();

    return [true, '혈액투석 메모 저장에 성공했습니다.'];
  } catch (err) {
    console.log('err', err);
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertHemodialysisMemo Query error\n: ${err.message}`);

    return [false, err.message];
  }
}

exports.getHemodialysisMemo = async function (userId, year, month) {
  const connection = await pool.getConnection(async (conn) => conn);

  let hemodialysisMemos = [];

  const getHemodialysisHeaderMemoQuery = `
      SELECT dialysisId, recordDate
      FROM dialysisHeader 
      WHERE userId = ? AND YEAR(recordDate) = ? AND MONTH(recordDate) = ? AND dialysisTypeId = ?;
    `;

  const getHemodialysisHeaderMemoParams = [userId, year, month, dialysisTypes.HEMODIALYSIS];
  const [getHemodialysisHeaderMemoRows] = await connection.query(getHemodialysisHeaderMemoQuery, getHemodialysisHeaderMemoParams);

  const getHemodialysisDetailMemoQuery = `
    SELECT memo, photo
    FROM dialysisDetail 
    WHERE dialysisId = ?;
  `;

  if (getHemodialysisHeaderMemoRows.length) {
    for (dialysisMemo of getHemodialysisHeaderMemoRows) {
      const { dialysisId, recordDate } = dialysisMemo;

      const getHemodialysisDetailMemoParams = [dialysisId];
      const [getHemodialysisDetailMemoRows] = await connection.query(getHemodialysisDetailMemoQuery, getHemodialysisDetailMemoParams);

      if (getHemodialysisDetailMemoRows.length) {
        const { memo, photo } = getHemodialysisDetailMemoRows[0];
        hemodialysisMemos.push({ dialysisId, recordDate, memo, photo });
      }
    }
  }

  connection.release();

  return hemodialysisMemos;
}

exports.updateHemodialysisMemo = async function ({ imageUrl, memo, dialysisId }) {
  const connection = await pool.getConnection(async (conn) => conn);

  if (!(dialysisId || memo)) throw new Error('누락된 정보가 있습니다.');

  try {
    const getImageDialysisDetailQuery = `SELECT photo FROM dialysisDetail WHERE dialysisId = ?;`;
    const getImageDialysisDetailParams = [dialysisId];
    const [getImageDialysisDetailRows] = await connection.query(getImageDialysisDetailQuery, getImageDialysisDetailParams);

    const updateDialysisDetailQuery = `
      UPDATE dialysisDetail SET memo = ? ${imageUrl ? ', photo = ? ' : ''}
      WHERE dialysisId = ?;
    `;

    const updateDialysisDetailParams = imageUrl ? [memo, imageUrl, dialysisId] : [memo, dialysisId];
    await connection.query(updateDialysisDetailQuery, updateDialysisDetailParams);

    connection.release();

    return [true, '혈액투석 메모 수정에 성공했습니다.', getImageDialysisDetailRows ? getImageDialysisDetailRows[0].photo : null];
  } catch (err) {
    console.log('err', err);
    connection.release();

    logger.error(`App - updateHemodialysisMemo Query error\n: ${err.message}`);

    return [false, err.message];
  }
}

exports.deleteHemodialysisMemo = async function (dialysisId) {
  const connection = await pool.getConnection(async (conn) => conn);

  if (!dialysisId) throw new Error('누락된 정보가 있습니다.');

  try {
    const deleteDialysisHeaderQuery = `DELETE FROM dialysisHeader WHERE dialysisId = ?;`;
    const deleteDialysisHeaderParams = [dialysisId];
    await connection.query(deleteDialysisHeaderQuery, deleteDialysisHeaderParams);

    const getImageDialysisDetailQuery = `SELECT photo FROM dialysisDetail WHERE dialysisId = ?;`;
    const getImageDialysisDetailParams = [dialysisId];
    const [getImageDialysisDetailRows] = await connection.query(getImageDialysisDetailQuery, getImageDialysisDetailParams);

    const deleteDialysisDetailQuery = `DELETE FROM dialysisDetail WHERE dialysisId = ?;`;
    const deleteDialysisDetailParams = [dialysisId];
    await connection.query(deleteDialysisDetailQuery, deleteDialysisDetailParams);

    connection.release();
    return [true, '혈액투석 메모 삭제에 성공했습니다.', getImageDialysisDetailRows ? getImageDialysisDetailRows[0].photo : null];
  } catch (err) {
    console.log('err', err);
    connection.release();

    logger.error(`App - deleteHemodialysisMemo Query error\n: ${err.message}`);
    return [true, '혈액투석 메모 삭제에 실패했습니다.'];
  }
}