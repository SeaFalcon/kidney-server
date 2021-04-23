const dialysisDao = require('../dao/dialysisDao');

exports.saveHemodialysisMemo = async function (req, res) {
  const { file, body: { date, memo }, verifiedToken: { id }, } = req;

  try {
    if (file.location) {
      const [isSuccess, message] = await dialysisDao.insertHemodialysisMemo({ imageUrl: file.location, recordDate: date, memo, userId: id });

      if (isSuccess) {
        res.json({
          isSuccess: true,
          code: 200,
          message,
        });
      } else {
        res.json({
          isSuccess: false,
          code: 400,
          message,
        });
      }
    }
  } catch (err) {
    // res.status(500).send('서버 에러');
    res.json({
      code: 500,
      isSuccess: false,
      message: '서버 오류로 인해 투석일지 저장에 실패했습니다.',
    });
    console.log('saveHemodialysisMemo Error', err)
  }
}