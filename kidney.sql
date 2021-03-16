use mysql;

select * from mysql.user;

alter user 'root'@'localhost' identified with mysql_native_password by 'dreamchan12#';

UPDATE user SET authentication_string=null WHERE User='root';
flush privileges;


use kidney;


CREATE TABLE user
-- user Table Create SQL
(
    `userId`               INT             NOT NULL    AUTO_INCREMENT,
    `email`                VARCHAR(45)     NULL,
    `pw`                   VARCHAR(45)     NULL,
    `nickname`             VARCHAR(45)     NULL,
    `birth`                DATE            NULL,
    `gender`               CHAR(1)         NULL        COMMENT 'M: 남, F: 여',
    `height`               INT             NULL,
    `weight`               INT             NULL,
    `profileImageUrl`      VARCHAR(256)    NULL,
    `kidneyDiseaseTypeId`  INT             NULL,
    `isDeleted`            CHAR(1)         NULL        DEFAULT 'N',
    `createdAt`            TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`            TIMESTAMP       NULL        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (userId)
);


-- user Table Create SQL
CREATE TABLE kidneyDiseaseType
(
    `kidneyDiseaseTypeId`     INT            NOT NULL    AUTO_INCREMENT,
    `kidneyDiseaseTypeName`   VARCHAR(45)    NULL,
    `requiredProtein`         INT            NULL,
    `bloodPressureSystolic`   INT            NULL        COMMENT '수축기',
    `bloodPressureDiastolic`  INT            NULL        COMMENT '이완기',
    `requiredPotassium`       INT            NULL        COMMENT '칼륨',
    `requiredSodium`          INT            NULL        COMMENT '나트륨',
    `requiredPhosphorus`      INT            NULL        COMMENT '인',
    `requiredCalcium`         INT            NULL        COMMENT '칼슘',
    PRIMARY KEY (kidneyDiseaseTypeId)
);


-- user Table Create SQL
CREATE TABLE userRequiredNuturition
(
    `userId`                  INT    NOT NULL    AUTO_INCREMENT,
    `requiredProtein`         INT    NULL,
    `bloodPressureSystolic`   INT    NULL        COMMENT '수축기',
    `bloodPressureDiastolic`  INT    NULL        COMMENT '이완기',
    `requiredPotassium`       INT    NULL        COMMENT '칼륨',
    `requiredSodium`          INT    NULL        COMMENT '나트륨',
    `requiredPhosphorus`      INT    NULL        COMMENT '인',
    `requiredCalcium`         INT    NULL        COMMENT '칼슘',
    PRIMARY KEY (userId)
);


-- user Table Create SQL
CREATE TABLE foodIntakeRecord
(
    `foodIntakeRecordId`      INT            NOT NULL    AUTO_INCREMENT,
    `userId`                  VARCHAR(45)    NULL,
    `foodIntakeRecordTypeId`  INT            NULL,
    `createdAt`               TIMESTAMP      NULL,
    `updatedAt`               TIMESTAMP      NULL,
    PRIMARY KEY (foodIntakeRecordId)
);


-- user Table Create SQL
CREATE TABLE food
(
    `foodId`        INT            NOT NULL    AUTO_INCREMENT,
    `foodName`      VARCHAR(45)    NULL,
    `calorie`       INT            NULL        COMMENT '칼로리',
    `carbohydrate`  INT            NULL        COMMENT '탄수화물',
    `protein`       INT            NULL        COMMENT '단백질',
    `fat`           INT            NULL        COMMENT '지방',
    `sodium`        INT            NULL        COMMENT '나트륨',
    `calcium`       INT            NULL        COMMENT '칼슘',
    `potassium`     INT            NULL        COMMENT '칼륨',
    `iron`          INT            NULL        COMMENT '철',
    `phosphorus`    INT            NULL        COMMENT '인',
    PRIMARY KEY (foodId)
);


-- user Table Create SQL
CREATE TABLE foodIntakeRecordSub
(
    `foodIntakeRecordId`  INT            NOT NULL    AUTO_INCREMENT,
    `foodId`              VARCHAR(45)    NULL,
    PRIMARY KEY (foodIntakeRecordId)
);


-- user Table Create SQL
CREATE TABLE foodIntakeRecordType
(
    `foodIntakeRecordTypeId`    INT            NOT NULL    AUTO_INCREMENT,
    `foodIntakeRecordTypeName`  VARCHAR(45)    NULL,
    PRIMARY KEY (foodIntakeRecordTypeId)
);

-- user Table Create SQL
CREATE TABLE myRecipe
(
    `recipeId`    INT            NOT NULL    AUTO_INCREMENT,
    `recipeName`  VARCHAR(45)    NULL,
    `createdAt`   TIMESTAMP      NULL        DEFAULT CURRENT_TIMESTAMP,
    `updatedAt`   TIMESTAMP      NULL        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (recipeId)
);


-- user Table Create SQL
CREATE TABLE myRecipeSub
(
    `recipeId`  INT            NOT NULL,
    `foodId`    VARCHAR(45)    NOT NULL,
    PRIMARY KEY (recipeId, foodId)
);




검색 > 음식 자세히보기 > 영양소를 그래프 형태로

내음식 > 음식 검색해서 레시피완성하는 그림


투석의 경우

주입액 농도 0 ~ 8
주입량 (g) 
배양량 (g) 
제수량 (주입량 - 배양량 g) > 알아볼 예정 
배액백 사진 첨부

몸무게 전 / 후
혈압 (전/후 - 수축기 / 이완기)

————————————————————

내 음식

음식리스트에서 체크할때마다
리스트에 추가해서 최종으로 이름 적고 레시피 완성
