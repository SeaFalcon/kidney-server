const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");

const dialysisTypes = {
  'MACHINE_DIALYSIS': 1, // 기계 복막투석
  'GENETAL_DIALYSIS': 2, // 일반 복막투석
  'HEMODIALYSIS': 3      // 혈액투석
}

exports.insertHemodialysisMemo = async function ({ imageUrl, recordDate, memo, userId }) {
  const connection = await pool.getConnection(async (conn) => conn);

  if (!(imageUrl, recordDate, memo)) throw new Error('누락된 정보가 있습니다.');

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

    console.log('isExistdialysisHeaderRows', isExistdialysisHeaderRows);

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

    return [true, '투석일지 저장에 성공했습니다.'];
  } catch (err) {
    console.log('err', err);
    await connection.rollback(); // COMMIT
    connection.release();

    logger.error(`App - insertHemodialysisMemo Query error\n: ${err.message}`);

    return [false, err.message];
  }
}