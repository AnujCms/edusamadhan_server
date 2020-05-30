CREATE TABLE `schooldb`.`transportfee` (
  `transportfeeid` INT NOT NULL AUTO_INCREMENT,
  `accountid` INT NOT NULL,
  `userid` INT NOT NULL,
  `route` VARCHAR(225) NOT NULL,
  `fee` INT NOT NULL,
  `createddate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transportfeeid`));

  alter table transportfee add column session int after fee;

