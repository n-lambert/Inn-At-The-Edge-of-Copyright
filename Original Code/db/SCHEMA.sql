CREATE TABLE `heroku_dd2cb150d033ed5`.`players` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(320) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `characterName` VARCHAR(45) NOT NULL,
  `isLiving` TINYINT NOT NULL DEFAULT 1,
  `isNPC` TINYINT NOT NULL DEFAULT 0,
  `WIS` DECIMAL(4,2) NOT NULL DEFAULT 0,
  `DEX` DECIMAL(4,2) NOT NULL DEFAULT 0,
  `STR` DECIMAL(4,2) NOT NULL DEFAULT 0,
  `HP` INT NOT NULL DEFAULT 20,
  `maxHP` INT NOT NULL DEFAULT 20,
  `race` VARCHAR(45) NULL,
  `class` VARCHAR(45) NULL,
  `abilities` VARCHAR(45) NULL,
  `inventory` TINYINT NOT NULL DEFAULT 0,
  `lastLocation` INT NOT NULL DEFAULT 1003,
  `backstory` TEXT NULL,
  `description` VARCHAR(450) NULL,
  `headSlot` INT NOT NULL DEFAULT 0,
  `neckSlot` INT NOT NULL DEFAULT 0,
  `torsoSlot` INT NOT NULL DEFAULT 0,
  `rightHandSlot` INT NOT NULL DEFAULT 0,
  `leftHandSlot` INT NOT NULL DEFAULT 0,
  `legsSlot` INT NOT NULL DEFAULT 0,
  `feetSlot` INT NOT NULL DEFAULT 0,
  `ringSlot` INT NOT NULL DEFAULT 0,
  `handsSlot` INT NOT NULL DEFAULT 0,
  `twoHands` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


CREATE TABLE `heroku_dd2cb150d033ed5`.`locations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `locationName` VARCHAR(45) NOT NULL,
  `dayDescription` VARCHAR(750) NULL,
  `nightDescription` VARCHAR(750) NULL,
  `exitN` INT NULL,
  `exitE` INT NULL,
  `exitS` INT NULL,
  `exitW` INT NULL,
  `region` VARCHAR(450) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


CREATE TABLE `heroku_dd2cb150d033ed5`.`weather` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `weatherCondition` VARCHAR(45) NOT NULL,
  `dayDescription` VARCHAR(750) NULL,
  `nightDescription` VARCHAR(750) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


CREATE TABLE `heroku_dd2cb150d033ed5`.`actions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `actionName` VARCHAR(45) NOT NULL,
  `commandBriefDescription` VARCHAR(750) NOT NULL,
  `commandLongDescription` VARCHAR(750) NOT NULL,
  `waysToCall` VARCHAR(450) NOT NULL,
  `exampleCall` VARCHAR(450),
  `exampleResult` VARCHAR(450),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


CREATE TABLE `heroku_dd2cb150d033ed5`.`quests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `questTitle` VARCHAR(45) NOT NULL,
  `dialogue` TEXT NOT NULL,
  `hints` VARCHAR(400) NOT NULL,
  `XPorItem` TINYINT NOT NULL,
  `reward` BIGINT NOT NULL,
  `completionItem` BIGINT NOT NULL,
  `questToken` BIGINT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


CREATE TABLE `heroku_dd2cb150d033ed5`.`items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `itemName` VARCHAR(45) NOT NULL,
  `description` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `inventory` TINYINT NOT NULL DEFAULT 0,
  `inventorySize` BIGINT NULL DEFAULT NULL,
  `headSlot` TINYINT NOT NULL DEFAULT 0,
  `neckSlot` TINYINT NOT NULL DEFAULT 0,
  `torsoSlot` TINYINT NOT NULL DEFAULT 0,
  `rightHandSlot` TINYINT NOT NULL DEFAULT 0,
  `leftHandSlot` TINYINT NOT NULL DEFAULT 0,
  `legsSlot` TINYINT NOT NULL DEFAULT 0,
  `feetSlot` TINYINT NOT NULL DEFAULT 0,
  `ringSlot` TINYINT NOT NULL DEFAULT 0,
  `handsSlot` TINYINT NOT NULL DEFAULT 0,
  `twoHands` TINYINT NOT NULL DEFAULT 0,
  `edible` TINYINT NOT NULL DEFAULT 0,
  `healthEffect` INT NULL DEFAULT NULL,
  `WISeffect` INT NOT NULL DEFAULT 0,
  `STReffect` INT NOT NULL DEFAULT 0,
  `DEXeffect` INT NOT NULL DEFAULT 0,
  `HPeffect` INT NOT NULL DEFAULT 0,
 PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


CREATE TABLE `heroku_dd2cb150d033ed5`.`inventories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `locator_id` VARCHAR(45) NOT NULL,
  `item_id` BIGINT NOT NULL,
  `quantity` BIGINT NOT NULL,
  `currentlyEquipped` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


  CREATE TABLE `heroku_dd2cb150d033ed5`.`races` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `raceName` VARCHAR(45) NOT NULL,
  `description` VARCHAR(450) NOT NULL,
  `STRbonus` INT NOT NULL DEFAULT 0,
  `DEXbonus` INT NOT NULL DEFAULT 0,
  `WISbonus` INT NOT NULL DEFAULT 0,
  `HPbonus` INT NOT NULL,
  `specialAbility` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));


CREATE TABLE `heroku_dd2cb150d033ed5`.`classes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `className` VARCHAR(45) NOT NULL,
  `description` VARCHAR(450) NOT NULL,
  `specialItem` INT NULL DEFAULT NULL,
  `level1Ability` INT NOT NULL,
  `level2Ability` INT NOT NULL,
  `level3Ability` INT NOT NULL,
  `level4Ability` INT NOT NULL,
  `level5Ability` INT NOT NULL,
  `level6Ability` INT NOT NULL,
  `level7Ability` INT NOT NULL,
  `level8Ability` INT NOT NULL,
  `level9Ability` INT NOT NULL,
  `level10Ability` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));

  CREATE TABLE `heroku_dd2cb150d033ed5`.`dialog` (
  `id` INT NOT NULL,
  `NPC` VARCHAR(255) NOT NULL,
  `dialogObj` LONGTEXT NOT NULL,
  PRIMARY KEY (`NPC`),
  UNIQUE INDEX `NPC_UNIQUE` (`NPC` ASC));
