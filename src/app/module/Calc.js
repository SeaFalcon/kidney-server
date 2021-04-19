
const getAgeFromBirth = function (birth) {
  return new Date().getFullYear() - new Date(birth).getFullYear();
};

const convertHeight = function (height) {
  return height * 0.01;
};


/*  ////////////////////////////////
  Calorie section
*/  ////////////////////////////////

// kidney Type
// nephrotic syndrome 신증후군
// 해당없음
const getMaleRequiredcalorie = function (weight, age, convertedHeight, activityCoefficient) {
  return 662 - 9.53 * age + activityCoefficient * (15.91 * weight + 539.6 * convertedHeight);
};

const getFeMaleRequiredcalorie = function (weight, age, convertedHeight, activityCoefficient) {
  return 354 - 6.91 * age + activityCoefficient * (9.36 * weight + 726 * convertedHeight);
};

const calorieFunctions = {
  // 투석전단계<신증후군>      nephrotic syndrome
  1: ({ gender, weight, age, height, activityCoefficient }) =>
    gender === 'M'
      ? getMaleRequiredcalorie(weight, age, convertHeight(height), activityCoefficient)
      : getFeMaleRequiredcalorie(weight, age, convertHeight(height), activityCoefficient),
  // 투석전단계<만성신부전>     chronic kidney disease
  2: ({ height, gender }) => convertHeight(height) ** 2 * (gender === 'M' ? 22 : 21) * 35,
  // 신장이식<신장이식직후~8주>  KidneyTransplant
  3: ({ height, gender }) => convertHeight(height) ** 2 * (gender === 'M' ? 22 : 21) * 32.5,
  // 신장이식<신장이식8주후>  KidneyTransplantAfter8Week
  4: ({ height, gender }) => convertHeight(height) ** 2 * (gender === 'M' ? 22 : 21) * 30,
  // 혈액투석                Hemodialysis
  5: ({ height, gender }) => convertHeight(height) ** 2 * (gender === 'M' ? 22 : 21) * 32.5,
  // 복막투석 peritonealDialysis
  6: ({ height, gender }) => convertHeight(height) ** 2 * (gender === 'M' ? 22 : 21) * 30,
  // 해당없음
  7: ({ gender, weight, age, height, activityCoefficient }) =>
    gender === 'M'
      ? getMaleRequiredcalorie(weight, age, convertHeight(height), activityCoefficient)
      : getFeMaleRequiredcalorie(weight, age, convertHeight(height), activityCoefficient),
}

/*  ////////////////////////////////
  Potassium section
*/  ////////////////////////////////
const getPotassium = function () {
  return 2000;
};


/*  ////////////////////////////////
  Protein section
*/  ////////////////////////////////
const getProteinByCoefficient = function (gender, height, proteinCoefficientByKidneyType) {
  if (gender === "M") {
    return proteinCoefficientByKidneyType * convertHeight(height) ** 2 * 22;
  } else {
    return proteinCoefficientByKidneyType * convertHeight(height) ** 2 * 21;
  }
};

const getProteinByAge = function (gender, age) {
  if (gender === "M") {
    if (age >= 12 && age <= 14) {
      return 60;
    } else if (age >= 15 && age <= 49) {
      return 65;
    } else {
      return 60;
    }
  } else if (gender === "F") {
    if (age >= 12 && age <= 29) {
      return 55;
    } else {
      return 50;
    }
  }
};

const getProtein = function(kidneyType, gender, height, proteinCoefficientByKidneyType, age){
  if(kidneyType === 7) return getProteinByAge(gender, age);
  return getProteinByCoefficient(gender, height, proteinCoefficientByKidneyType);
}

/*  ////////////////////////////////
  Phosphorus section
*/  ////////////////////////////////
const getPhosphorusByAge = function (age) {
  if (age >= 12 && age <= 18) {
    return 1200;
  } else {
    return 700;
  }
};

const getPhosphorusWhenChronicKidneyDisease = function (height) {
  const phosphorus = convertHeight(height) ** 2 * 21 * 10;
  if (phosphorus >= 700) {
    return 700;
  } else {
    return phosphorus;
  }
};

const getPhosphorus = function (kidneyType, height, age) {
  if(kidneyType === 2) return getPhosphorusByAge(age);
  return getPhosphorusWhenChronicKidneyDisease(height)
}

/*  ////////////////////////////////
  Sodium section
*/  ////////////////////////////////
const getSodiumByAge = function (age) {
  if (age >= 12 && age <= 64) {
    return 2300;
  }
  if (age >= 65 && age <= 74) {
    return 2100;
  } else {
    return 1700;
  }
};

module.exports = {
  getAgeFromBirth,
  getPotassium,
  getProtein,
  getPhosphorus,
  getSodiumByAge,
  calorieFunctions
};