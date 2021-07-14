const dialysisDao = require("../dao/dialysisDao");
const { s3 } = require("../../../config/s3");

exports.saveHemodialysisMemo = async function (req, res) {
  const {
    file,
    body: { date, memo },
    verifiedToken: { id },
  } = req;

  if (!date || !memo) {
    return res.json({
      isSuccess: false,
      code: 400,
      message: "날짜 혹은 메모정보가 누락 되었습니다.",
    });
  }
  console.log("memo");
  console.log(memo);

  try {
    const [isSuccess, message] = await dialysisDao.insertHemodialysisMemo({
      imageUrl: file && file.location ? file.location : null,
      recordDate: date,
      memo,
      userId: id,
    });

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
      message: "서버 오류로 인해 투석일지 저장에 실패했습니다.",
    });
    console.log("saveHemodialysisMemo Error", err);
  }
};

exports.getHemodialysisMemo = async function (req, res) {
  const {
    verifiedToken: { id },
    query: { date },
  } = req;

  try {
    const dateInstance = new Date(date);
    const year = dateInstance.getFullYear();
    const month = dateInstance.getMonth() + 1;

    const hemodialysisMemos = await dialysisDao.getHemodialysisMemo(
      id,
      year,
      month
    );

    // console.log(hemodialysisMemos)

    if (hemodialysisMemos.length) {
      res.json({
        code: 200,
        isSuccess: true,
        message: "투석일지 불러오기에 성공했습니다.",
        hemodialysisMemos,
      });
    } else {
      res.json({
        code: 200,
        isSuccess: false,
        message: "해당 월에 작성된 투석일지가 없습니다.",
      });
    }
  } catch (err) {
    res.json({
      code: 500,
      isSuccess: false,
      message: "서버 오류로 인해 투석일지 불러오기에 실패했습니다.",
    });
    console.log("getHemodialysisMemo Error", err);
  }
};

exports.changeHemodialysisMemo = async function (req, res) {
  const {
    file,
    body: { name, dialysisId },
    verifiedToken: { id },
  } = req;

  if (!name || !dialysisId) {
    return res.json({
      isSuccess: false,
      code: 400,
      message: "메모 정보가 누락 되었습니다.",
    });
  }

  try {
    const [isSuccess, message, imageUrl] =
      await dialysisDao.updateHemodialysisMemo({
        imageUrl: file && file.location ? file.location : null,
        memo: name,
        dialysisId,
      });

    if (isSuccess) {
      if (imageUrl) {
        var params = {
          Bucket: "chlngersimage",
          Key: imageUrl.split("/").pop(),
        };
        s3.deleteObject(params, function (err, data) {
          if (err) {
            // an error occurred
            console.log(err, err.stack);
            throw new Error(err);
          }
          console.log("aws s3 image delete success : " + JSON.stringify(data)); // successful response
        });
      }

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
    res.json({
      code: 500,
      isSuccess: false,
      message: "서버 오류로 인해 투석일지 수정에 실패했습니다.",
    });
    console.log("changeHemodialysisMemo Error", err);
  }
};

exports.removeHemodialysisMemo = async function (req, res) {
  const {
    params: { dialysisId },
    verifiedToken: { id },
  } = req;

  if (!dialysisId) {
    return res.json({
      isSuccess: false,
      code: 400,
      message: "메모 정보 ID (dialysisId)가 누락되었습니다.",
    });
  }

  try {
    const [isSuccess, message, imageUrl] =
      await dialysisDao.deleteHemodialysisMemo(dialysisId);

    if (imageUrl) {
      var params = {
        Bucket: "chlngersimage",
        Key: imageUrl.split("/").pop(),
      };
      s3.deleteObject(params, function (err, data) {
        if (err) {
          // an error occurred
          console.log(err, err.stack);
          throw new Error(err);
        }
        console.log("aws s3 image delete success : " + JSON.stringify(data)); // successful response
      });
    }

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
    res.json({
      code: 500,
      isSuccess: false,
      message: "서버 오류로 인해 투석일지 삭제에 실패했습니다.",
    });
    console.log("deleteHemodialysisMemo Error", err);
  }
};

//복막투석 저장
exports.savePeritonrumMemo = async function (req, res) {
  console.log("들어옴");
  const {
    file,
    verifiedToken: { id },
    body: { dialysis, date, dialysisType },
  } = req;

  console.log("req", req.body.dialysis);

  try {
    const [isSuccess, message] = await dialysisDao.insertGeneraldialysisMemo({
      imageUrl: file && file.location ? file.location : null,
      recordDate: date,
      dialysis,
      dialysisType,
      userId: id,
    });

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
      message: "서버 오류로 인해 투석일지 저장에 실패했습니다.",
    });
    console.log("saveGeneraldialysisMemo Error", err);
  }
};

// 복막 투석 가져오기 (기계 투석 or 일반투석 이면 가져오기)
exports.getPeritonrumMemo = async function (req, res) {
  const {
    verifiedToken: { id },
    query: { date },
  } = req;

  try {
    const dateInstance = new Date(date);
    const year = dateInstance.getFullYear();
    const month = dateInstance.getMonth() + 1;

    const hemodialysisMemos = await dialysisDao.getPeritonrumMemo(
      id,
      year,
      month
    );

    if (hemodialysisMemos.length) {
      res.json({
        code: 200,
        isSuccess: true,
        message: "투석일지 불러오기에 성공했습니다.",
        hemodialysisMemos,
      });
    } else {
      res.json({
        code: 200,
        isSuccess: false,
        message: "해당 월에 작성된 투석일지가 없습니다.",
      });
    }
  } catch (err) {
    res.json({
      code: 500,
      isSuccess: false,
      message: "서버 오류로 인해 투석일지 불러오기에 실패했습니다.",
    });
    console.log("getPeritonrumMemo Error", err);
  }
};

exports.changePeritonrumMemo = async function (req, res) {
  const {
    file,
    body: { dialysis, dialysisId },
    verifiedToken: { id },
  } = req;
  console.log(dialysis);

  if (!dialysisId) {
    return res.json({
      isSuccess: false,
      code: 400,
      message: "메모 정보가 누락 되었습니다.",
    });
  }

  try {
    const [isSuccess, message, imageUrl] =
      await dialysisDao.updateGenaraldialysisMemo({
        imageUrl: file && file.location ? file.location : null,
        dialysis,
        dialysisId,
      });

    if (isSuccess) {
      if (imageUrl) {
        var params = {
          Bucket: "chlngersimage",
          Key: imageUrl.split("/").pop(),
        };
        s3.deleteObject(params, function (err, data) {
          if (err) {
            // an error occurred
            console.log(err, err.stack);
            throw new Error(err);
          }
          console.log("aws s3 image delete success : " + JSON.stringify(data)); // successful response
        });
      }

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
    res.json({
      code: 500,
      isSuccess: false,
      message: "서버 오류로 인해 투석일지 수정에 실패했습니다.",
    });
    console.log("changeHemodialysisMemo Error", err);
  }
};

// 복막 투석 가져오기 (기계 투석 or 일반투석 이면 가져오기)
exports.getWeekPeritonrumMemo = async function (req, res) {
  const {
    verifiedToken: { id },
    query: { firstday, lastday },
  } = req;

  console.log("getWeekPeritonrumMemo : " + firstday + " : " + lastday);

  try {
    const dateInstance1 = new Date(firstday);
    const year1 = dateInstance1.getFullYear();
    const month1 = dateInstance1.getMonth() + 1;

    const dateInstance2 = new Date(lastday);
    const year2 = dateInstance2.getFullYear();
    const month2 = dateInstance2.getMonth() + 1;

    //    console.log(dateInstance1 + " : " + dateInstance2);
    const hemodialysisMemos = await dialysisDao.getPeritonrumMemo(
      id,
      dateInstance1,
      dateInstance2
    );

    if (hemodialysisMemos.length) {
      res.json({
        code: 200,
        isSuccess: true,
        message: "투석일지 불러오기에 성공했습니다.",
        hemodialysisMemos,
      });
    } else {
      res.json({
        code: 200,
        isSuccess: false,
        message: "해당 월에 작성된 투석일지가 없습니다.",
      });
    }
  } catch (err) {
    res.json({
      code: 500,
      isSuccess: false,
      message: "서버 오류로 인해 투석일지 불러오기에 실패했습니다.",
    });
    console.log("getPeritonrumMemo Error", err);
  }
};
