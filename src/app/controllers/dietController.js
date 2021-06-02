const dietDao = require('../dao/dietDao');

exports.saveDiet = async function (req, res) {
  const { body: { recommendDiets } } = req;

  try {

    const [isSuccess, message] = await dietDao.insertDiet({ recommendDiets });

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
  } catch (err) {
    // res.status(500).send('서버 에러');
    res.json({
      code: 500,
      isSuccess: false,
      message: '서버 오류로 인해 투석일지 저장에 실패했습니다.',
    });
    console.log('saveDiet Error', err)
  }
}