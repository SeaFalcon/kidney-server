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
      FROM DialysisHeader
      WHERE date(recordDate) = date(concat('', ?))
    `;

        const isExistdialysisHeaderParams = [recordDate];
        let [isExistdialysisHeaderRows] = await connection.query(
            isExistdialysisHeaderQuery,
            isExistdialysisHeaderParams
        );

        if (isExistdialysisHeaderRows.length) throw new Error('이미 투석일지 / 메모가 작성된 날입니다.');

        const insertDialysisHeaderQuery = `
        INSERT INTO DialysisHeader (userId, recordDate, dialysisTypeId) 
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
      INSERT INTO DialysisDetail (dialysisId, memo, photo)
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
      SELECT dialysisId, recordDate, dialysisTypeId
      FROM DialysisHeader 
      WHERE userId = ? AND YEAR(recordDate) = ? AND MONTH(recordDate) = ? AND dialysisTypeId = ?;
    `;

    const getHemodialysisHeaderMemoParams = [userId, year, month, dialysisTypes.HEMODIALYSIS];
    const [getHemodialysisHeaderMemoRows] = await connection.query(getHemodialysisHeaderMemoQuery, getHemodialysisHeaderMemoParams);

    const getHemodialysisDetailMemoQuery = `
    SELECT degrees, exchangeTime, injectionConcentration, injectionAmount, drainage, dehydration, weight, bloodPressure, bloodSugar, edema, memo, photo
    FROM DialysisDetail 
    WHERE dialysisId = ?;
  `;

    if (getHemodialysisHeaderMemoRows.length) {
        for (dialysisMemo of getHemodialysisHeaderMemoRows) {
            const { dialysisId, recordDate, dialysisTypeId } = dialysisMemo;

            const getHemodialysisDetailMemoParams = [dialysisId];
            const [getHemodialysisDetailMemoRows] = await connection.query(getHemodialysisDetailMemoQuery, getHemodialysisDetailMemoParams);

            if (getHemodialysisDetailMemoRows.length) {
                const { degrees, exchangeTime, injectionConcentration, injectionAmount, drainage, dehydration, weight, bloodPressure, bloodSugar, edema, memo, photo } = getHemodialysisDetailMemoRows[0];
                hemodialysisMemos.push({ dialysisId, recordDate, dialysisTypeId, degrees, exchangeTime, injectionConcentration, injectionAmount, drainage, dehydration, weight, bloodPressure, bloodSugar, edema, memo, photo });
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
        const getImageDialysisDetailQuery = `SELECT photo FROM DialysisDetail WHERE dialysisId = ?;`;
        const getImageDialysisDetailParams = [dialysisId];
        const [getImageDialysisDetailRows] = await connection.query(getImageDialysisDetailQuery, getImageDialysisDetailParams);

        const updateDialysisDetailQuery = `
      UPDATE DialysisDetail SET memo = ? ${imageUrl ? ', photo = ? ' : ''}
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

exports.insertGeneraldialysisMemo = async function ({ imageUrl, recordDate, dialysisType, dialysis, userId }) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction(); // START TRANSACTION

        // 오늘 추가된 HemodialysisMemo 가 있는지 확인
        const isExistdialysisHeaderQuery = `
            SELECT dialysisId
            FROM DialysisHeader
            WHERE date(recordDate) = date(concat('', ?))
    `;

        const isExistdialysisHeaderParams = [recordDate];
        let [isExistdialysisHeaderRows] = await connection.query(
            isExistdialysisHeaderQuery,
            isExistdialysisHeaderParams
        );

        console.log('isExistdialysisHeaderRows', isExistdialysisHeaderRows);

        if (isExistdialysisHeaderRows.length) throw new Error('이미 투석일지 / 메모가 작성된 날입니다.');

        const insertDialysisHeaderQuery = `
             INSERT INTO DialysisHeader (userId, recordDate, dialysisTypeId) 
             VALUES (?, ?, ?);
      `;


        const insertDialysisHeaderParams = [userId, recordDate, (dialysisType === 1) ? dialysisTypes.MACHINE_DIALYSIS : dialysisTypes.GENETAL_DIALYSIS];
        const [insertDialysisHeaderResult] = await connection.query(
            insertDialysisHeaderQuery,
            insertDialysisHeaderParams
        );

        const dialysisId = insertDialysisHeaderResult.insertId;

        const insertDialysisDetailQuery = `
            INSERT INTO DialysisDetail (dialysisId, degrees, exchangeTime, injectionConcentration, injectionAmount, drainage, dehydration, weight, bloodPressure, bloodSugar, edema, memo, photo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

        const insertDialysisDetailParams = [dialysisId, dialysis.degrees, dialysis.exchangeTime.replace('T', ' ').replace('.000Z', ''), dialysis.injectionConcentration, dialysis.injectionAmount, dialysis.drainage, dialysis.dehydration, dialysis.weight, dialysis.bloodPressure, dialysis.bloodSugar, dialysis.edema, dialysis.memo, imageUrl]
        console.log(insertDialysisDetailParams);
        await connection.query(insertDialysisDetailQuery, insertDialysisDetailParams);

        await connection.commit(); // COMMIT
        connection.release();

        return [true, '복막투석 메모 저장에 성공했습니다.'];
    } catch (err) {
        console.log('err', err);
        await connection.rollback(); // COMMIT
        connection.release();

        logger.error(`App - insertGeneralDialysisMemo Query error\n: ${err.message}`);

        return [false, err.message];
    }
}


exports.getPeritonrumMemo = async function (userId, year, month) {
    const connection = await pool.getConnection(async (conn) => conn);

    let hemodialysisMemos = [];

    const getPeritonrumHeaderMemoQuery = `
      SELECT dialysisId, recordDate, dialysisTypeId
      FROM DialysisHeader 
      WHERE userId = ? AND YEAR(recordDate) = ? AND MONTH(recordDate) = ? AND dialysisTypeId = 1 or dialysisTypeId = 2;
    `;

    const getPeritonrumHeaderMemoParams = [userId, year, month];
    const [getPeritonrumHeaderMemoRows] = await connection.query(getPeritonrumHeaderMemoQuery, getPeritonrumHeaderMemoParams);

    const getPeritonrumDetailMemoQuery = `
    SELECT degrees, exchangeTime, injectionConcentration, injectionAmount, drainage, dehydration, weight, bloodPressure, bloodSugar, edema, memo, photo
    FROM DialysisDetail 
    WHERE dialysisId = ?;
  `;

    if (getPeritonrumHeaderMemoRows.length) {
        for (dialysisMemo of getPeritonrumHeaderMemoRows) {
            const { dialysisId, recordDate, dialysisTypeId } = dialysisMemo;

            const getPeritonrumDetailMemoParams = [dialysisId];
            const [getPeritonrumDetailMemoRows] = await connection.query(getPeritonrumDetailMemoQuery, getPeritonrumDetailMemoParams);

            if (getPeritonrumDetailMemoRows.length) {
                const { degrees, exchangeTime, injectionConcentration, injectionAmount, drainage, dehydration, weight, bloodPressure, bloodSugar, edema, memo, photo } = getPeritonrumDetailMemoRows[0];
                hemodialysisMemos.push({ dialysisId, recordDate, dialysisTypeId, degrees, exchangeTime, injectionConcentration, injectionAmount, drainage, dehydration, weight, bloodPressure, bloodSugar, edema, memo, photo });
            }
        }
    }

    connection.release();

    return hemodialysisMemos;
}


exports.updateGenaraldialysisMemo = async function ({ imageUrl, dialysis, dialysisId }) {
    const connection = await pool.getConnection(async (conn) => conn);

    if (!dialysisId) throw new Error('누락된 정보가 있습니다.');

    try {

        const getImageDialysisDetailQuery = `SELECT photo FROM DialysisDetail WHERE dialysisId = ?;`;
        const getImageDialysisDetailParams = [dialysisId];
        const [getImageDialysisDetailRows] = await connection.query(getImageDialysisDetailQuery, getImageDialysisDetailParams);

        const updateDialysisDetailQuery = `
            UPDATE DialysisDetail SET degrees=?, exchangeTime = ?, injectionConcentration=?, injectionAmount=?, drainage=?, dehydration=?, weight=?, bloodPressure=?, bloodSugar=?, edema=?, memo = ?  ${imageUrl ? ', photo = ? ' : ''}
            WHERE dialysisId = ?;
        `;

        const updateDialysisDetailParams = imageUrl 
            ? [dialysis.degrees, dialysis.exchangeTime.replace('T', ' ').replace('.000Z', ''), dialysis.injectionConcentration, dialysis.injectionAmount, dialysis.drainage, dialysis.dehydration, dialysis.weight, dialysis.bloodPressure, dialysis.bloodSugar, dialysis.edema, dialysis.memo, imageUrl, dialysisId]
            : [dialysis.degrees, dialysis.exchangeTime.replace('T', ' ').replace('.000Z', ''), dialysis.injectionConcentration, dialysis.injectionAmount, dialysis.drainage, dialysis.dehydration, dialysis.weight, dialysis.bloodPressure, dialysis.bloodSugar, dialysis.edema, dialysis.memo, dialysisId];
        await connection.query(updateDialysisDetailQuery, updateDialysisDetailParams);

        connection.release();

        return [true, '일반투석 메모 수정에 성공했습니다.', getImageDialysisDetailRows ? getImageDialysisDetailRows[0].photo : null];
    } catch (err) {
        console.log('err', err);
        connection.release();

        logger.error(`App - updateGenaraldialysisMemo Query error\n: ${err.message}`);

        return [false, err.message];
    }
}



