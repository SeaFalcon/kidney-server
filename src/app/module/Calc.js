
let age = function (birth) {
    return new Date().getFullYear() - new Date(birth).getFullYear();
};

let Mheight = function (height) {
    return height * 0.01;
};

let Mcalorie = function (weight, age, Mheight, activity) {
    return 662 - 9.53 * age + activity * (15.91 * weight + 539.6 * Mheight);
};

let Fcalorie = function (weight, age, Mheight, activity) {
    return 354 - 6.91 * age + activity * (9.36 * weight + 726 * Mheight);
};
let potassium = function () {
    return 2000;
};
let nomalprotein = function (gender, Mheight, kidney) {
    if (gender === "M") {
        return kidney * Mheight ** 2 * 22;
    } else {
        return kidney* Mheight ** 2 * 21;
    }
};

let unnomalprotein = function (gender, age) {
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
let nomalPhosphorus = function (age) {
    if (age >= 12 && age <= 18) {
        return 1200;
    } else {
        return 700;
    }
};

let unomalPhosphorus = function (Mheight) {
    const phosphorus = Mheight ** 2 * 21 * 10;
    if (phosphorus >= 700) {
        return 700;
    } else {
        return phosphorus;
    }
};
let Sodium = function (age) {
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
    age,
    Mheight,
    Mcalorie,
    Fcalorie,
    potassium,
    unnomalprotein,
    nomalprotein,
    unomalPhosphorus,
    nomalPhosphorus,
    Sodium,
};



