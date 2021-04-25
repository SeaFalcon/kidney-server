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

exports.getHemodialysisMemo = async function (req, res) {
  const { verifiedToken: { id }, query: { date } } = req;

  try {
    const dateInstance = new Date(date);
    const year = dateInstance.getFullYear();
    const month = dateInstance.getMonth() + 1;

    const hemodialysisMemos = await dialysisDao.getHemodialysisMemo(id, year, month);

    console.log(hemodialysisMemos)

    if (hemodialysisMemos.length) {
      res.json({
        code: 200,
        isSuccess: true,
        message: '투석일지 불러오기에 성공했습니다.',
        hemodialysisMemos
      })
    }else{
      res.json({
        code: 200,
        isSuccess: false,
        message: '해당 월에 작성된 투석일지가 없습니다.',
      })
    }

  } catch (err) {
    res.json({
      code: 500,
      isSuccess: false,
      message: '서버 오류로 인해 투석일지 불러오기에 실패했습니다.',
    });
    console.log('getHemodialysisMemo Error', err)
  }

}