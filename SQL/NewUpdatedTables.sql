CREATE TABLE `config` (
  `configId` int(11) NOT NULL AUTO_INCREMENT,
  `configData` JSON NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`configId`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=latin1

****
CREATE TABLE `account` (
  `accountId` text,
  `accountName` text,
  `accountRefNumber` text,
  `accountAdmin` int(11) DEFAULT NULL,
  `accountStatus` int(11) DEFAULT NULL,
  `phoneNumber` text NOT NULL,
  `schoolLogo` text DEFAULT NULL,
  `parentAccountId` text,
  `accountAddress` text,
  `configId` int(11) DEFAULT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1

*******
CREATE TABLE `userDetails` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` text NOT NULL,
  `lastName` text NOT NULL,
  `cellNumber` text NOT NULL,
  `aadharNumber` varchar(255) NOT NULL,
  `dob` text,
  `emailId` varchar(255) DEFAULT NULL,
  `userName` text NOT NULL,
  `password` text NOT NULL,
  `status` int(11) DEFAULT NULL,
  `userrole` int(11) NOT NULL,
  `gender` text,
  `classId` int(11) DEFAULT NULL,
  `sectionId` int(11) DEFAULT NULL,
  `sessionId` int(11) DEFAULT NULL,
  `motherName` text,
  `fatherName` text,
  `religion` int(11) DEFAULT NULL,
  `category` int(11) DEFAULT NULL,
  `locality` int(11) DEFAULT NULL,
  `mediumType` int(11) NOT NULL,
  `subject` int(11) DEFAULT NULL,
  `qualification` int(11) DEFAULT NULL,
  `busService` int(11) DEFAULT NULL,
  `route` int(11) DEFAULT NULL,
  `salary` varchar(100) DEFAULT NULL,
   `images` text,
  `localAddress` varchar(255) DEFAULT NULL,
  `parmanentAddress` varchar(255) DEFAULT NULL,
  `wrongPasswordCount` int(11) DEFAULT NULL,
  `passwordChangeCount` int(11) DEFAULT NULL,
  `createdDatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `adharnumber_UNIQUE` (`aadharNumber`),
  UNIQUE KEY `emailid_UNIQUE` (`emailId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
***************
CREATE TABLE `director_user` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `directorId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `userType` int(11) NOT NULL,
  `userrole` int(11) NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=latin1
************
CREATE TABLE `teacher_principal` (
  `accountId` text NOT NULL,
  `userId` int(11) NOT NULL,
  `principalId` int(11) NOT NULL,
  `userType` int(11) NOT NULL,
  `userrole` int(11) NOT NULL,
  `entranceExamType` int(11) DEFAULT NULL,
  `createdDatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1
*******

CREATE TABLE `student_teacher` (
  `stId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `teacherid` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `userType` int(11) NOT NULL,
  `classId` int(11) NOT NULL,
  `sectionId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `createddDtetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
***********
CREATE TABLE `student_teacher` (
  `stId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `userType` int(11) NOT NULL,
  `classId` int(11) NOT NULL,
  `sectionId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `createddDtetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
********

CREATE TABLE `entranceResult` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `studentId` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `totalMarks` int(11) DEFAULT NULL,
  `obtainedMarks` int(11) DEFAULT NULL,
  `resultStatus` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
**********

CREATE TABLE `entranceQuestions` (
  `questionId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `classId` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `optiona` varchar(255) NOT NULL,
  `optionb` varchar(255) NOT NULL,
  `optionc` varchar(255) NOT NULL,
  `optiond` varchar(255) NOT NULL,
  `optione` varchar(255) NOT NULL,
  `answer` int(11) DEFAULT NULL,
  PRIMARY KEY (`questionId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1

************
CREATE TABLE `studentAttendance` (
  `attendanceId` int(11) NOT NULL AUTO_INCREMENT,
  `studentId` int(111) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `attendanceDate` date NOT NULL,
  `attendance` int(11) NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendanceId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
******
CREATE TABLE `examResultDetails` (
  `examresultId` int(11) NOT NULL AUTO_INCREMENT,
  `studentId` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `examinationType` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `subjectResultArray` json NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`examresultId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
**********
CREATE TABLE `subjectDetails` (
  `subjectId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `classId` int(11) DEFAULT NULL,
  `subjects` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`subjectId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1

************
CREATE TABLE `feeStructureDetails` (
  `feeStructureId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` text Not null,
  `classId` int(11) Not NULL,
  `sessionId` int(11) Not NULL,
  `mediumType` int(11) NOT NULL,
  `january` int(11) DEFAULT NULL,
  `february` int(11) DEFAULT NULL,
  `march` int(11) DEFAULT NULL,
  `april` int(11) DEFAULT NULL,
  `may` int(11) DEFAULT NULL,
  `june` int(11) DEFAULT NULL,
  `july` int(11) DEFAULT NULL,
  `august` int(11) DEFAULT NULL,
  `september` int(11) DEFAULT NULL,
  `october` int(11) DEFAULT NULL,
  `november` int(11) DEFAULT NULL,
  `december` int(11) DEFAULT NULL,
  PRIMARY KEY (`feeStructureId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
************
CREATE TABLE `studentFeeDetails` (
  `studentFeeId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(225) NOT NULL,
  `studentId` int(11) Not NULL,
  `sessionId` int(11) Not NULL,
  `january` json DEFAULT NULL,
  `february` json DEFAULT NULL,
  `march` json DEFAULT NULL,
  `april` json DEFAULT NULL,
  `may` json DEFAULT NULL,
  `june` json DEFAULT NULL,
  `july` json DEFAULT NULL,
  `august` json DEFAULT NULL,
  `september` json DEFAULT NULL,
  `october` json DEFAULT NULL,
  `november` json DEFAULT NULL,
  `december` json DEFAULT NULL,
  PRIMARY KEY (`studentFeeId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
***********
CREATE TABLE `studentTransportFeeDetails` (
  `studentFeeId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `studentId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `january` json DEFAULT NULL,
  `february` json DEFAULT NULL,
  `march` json DEFAULT NULL,
  `april` json DEFAULT NULL,
  `may` json DEFAULT NULL,
  `june` json DEFAULT NULL,
  `july` json DEFAULT NULL,
  `august` json DEFAULT NULL,
  `september` json DEFAULT NULL,
  `october` json DEFAULT NULL,
  `november` json DEFAULT NULL,
  `december` json DEFAULT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentFeeId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1

**********************
CREATE TABLE `transportStructureDetails` (
  `transportFeeId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(100) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `route` varchar(225) NOT NULL,
  `fee` int(11) NOT NULL,
  `vehicleNumber` varchar(100) NOT NULL,
  `driverName` varchar(100) NOT NULL,
  `driverNumber` varchar(100) NOT NULL,
  `driverSalary` int(11) NOT NULL,
  `vehicleType` int(11) NOT NULL,
  `vehicleColor` varchar(50) NOT NULL,
  `vehicleExpense` int(11) NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transportFeeId`),
  UNIQUE KEY `vehiclenumber_UNIQUE` (`vehicleNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
************
CREATE TABLE `expenseDetails` (
  `expenseId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `expenseName` varchar(255) NOT NULL,
  `expenseAmount` int(11) NOT NULL,
  `expenseDate` date NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`expenseId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
*************
CREATE TABLE `periodDetails` (
  `periodId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(225) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `period1` varchar(225) DEFAULT NULL,
  `period2` varchar(225) DEFAULT NULL,
  `period3` varchar(225) DEFAULT NULL,
  `period4` varchar(225) DEFAULT NULL,
  `period5` varchar(225) DEFAULT NULL,
  `period6` varchar(225) DEFAULT NULL,
  `period7` varchar(225) DEFAULT NULL,
  `period8` varchar(225) DEFAULT NULL,
  `period9` varchar(225) DEFAULT NULL,
  `period10` varchar(225) DEFAULT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`periodId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
**************
CREATE TABLE `timeTableDetails` (
  `timeTableId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(225) NOT NULL,
  `userId` int(11) NOT NULL,
  `classId` int(11) NOT NULL,
  `sectionId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `dayname` int(11) NOT NULL,
  `period1` varchar(225) DEFAULT NULL,
  `period2` varchar(225) DEFAULT NULL,
  `period3` varchar(225) DEFAULT NULL,
  `period4` varchar(225) DEFAULT NULL,
  `period5` varchar(225) DEFAULT NULL,
  `period6` varchar(225) DEFAULT NULL,
  `period7` varchar(225) DEFAULT NULL,
  `period8` varchar(225) DEFAULT NULL,
  `period9` varchar(225) DEFAULT NULL,
  `period10` varchar(225) DEFAULT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`timeTableId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1

*********
CREATE TABLE `classSeatDetails` (
  `classSeatId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `classId` int(11) NOT NULL,
  `sectionId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `totalRows` int(11) NOT NULL,
  `totalColumns` int(11) NOT NULL,
  `totalSeats` int(11) NOT NULL,
  `isAssigned` int(11) DEFAULT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`classSeatId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
***********
CREATE TABLE `mixedStudentsDetails` (
  `mixedClassStudentId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `mixedOptions` int(11) NOT NULL,
  `classArray` json NOT NULL,
  `mixedStudentList` json NOT NULL,
  `overFlowStudentList` json NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`mixedClassStudentId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
********
CREATE TABLE `schoolNotifications` (
  `notificationId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` text NOT NULL,
  `userrole` int(11) NOT NULL,
   `sessionId` int(11) NOT NULL,
  `createdBy` int(11) NOT NULL,
   `notificationUser` int(11) NOT NULL,
  `notificationSubject` text NOT NULL,
  `notificationCreatedDate` text NOT NULL,
  `notificationDescription` text NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificationId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
*************
CREATE TABLE `schoolEvents` (
  `eventId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` text NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) Not NULL,
  `eventName` text NOT NULL,
  `eventType` int(11) DEFAULT NULL,
  `eventData` text NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`eventId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
********
CREATE TABLE `seatingArrangement` (
  `seatingArrangementId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `classId` int(11) NOT NULL,
  `sectionId` int(11) NOT NULL,
  `totalColumns` int(11) NOT NULL,
  `totalRows` int(11) NOT NULL,
  `totalSeats` int(11) NOT NULL,
  `mixedOptions` int(11) NOT NULL,
  `classArray` json NOT NULL,
  `mixedStudentList` json NOT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`seatingArrangementId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
**********************
CREATE TABLE `authorityMessage` (
  `msgId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `messageUser` int(11) NOT NULL,
   `userType` int(11) NOT NULL,
  `images` text,
  `userMessage` json NOT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`msgId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
**********************
CREATE TABLE `achievementDetails` (
  `achievementId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `sessionId` int(11) NOT NULL,
	`classId` int(11) NOT NULL,
   `userType` int(11) NOT NULL,
  `images` text,
  `achievementsData` json NOT NULL,
 `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`achievementId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
********************
CREATE TABLE `mediaDetails` (
  `mediaId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `userType` int(11) NOT NULL,
  `mediaType` int(11) NOT NULL,
  `mediaTitle` text,
  `images` text,
 `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`mediaId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
**************
CREATE TABLE `refreshTokenPortal` (
  `userId` int(11) NOT NULL,
  `refreshToken` varchar(100) NOT NULL,
  `accessToken` varchar(500) NOT NULL,
  `createdDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`refreshToken`),
  KEY `userId` (`userId`),
  CONSTRAINT `refreshTokenPortal_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `userDetails` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1

****************************
CREATE TABLE `eBooksDetails` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `classId` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `numberOfBook` int(11) NOT NULL,
  `bookUrl` text NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
****************************
CREATE TABLE `facilityDetails` (
  `faculityId` int(11) NOT NULL AUTO_INCREMENT,
   `accountId` varchar(255) NOT NULL,
  `faculityType` int(11) NOT NULL,
  `facilityDetails` text,
  `images` text,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`faculityId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
******************************
CREATE TABLE `publicContentDetails` (
  `contentId` int(11) NOT NULL AUTO_INCREMENT,
   `accountId` varchar(255) NOT NULL,
  `contentType` int(11) NOT NULL,
  `contentUrl` text,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`contentId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
***********************
CREATE TABLE `passwordChangeRequest` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `initiatedBy` int(11) NOT NULL,
  `expireDatetime` datetime NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
**********************
CREATE TABLE `classHomeWorkDetails` (
  `homeWorkId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `classId` int(11) NOT NULL,
  `sectionId` int(11) NOT NULL,
  `mediumType` int(11) NOT NULL,
  `subjectId` int(11) NOT NULL,
  `homeWorkDate` text NOT NULL,
  `homeWorkDetails` varchar(255) NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`homeWorkId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
************************
ALTER TABLE studentAttendance
ADD reason varchar(255) after attendance;
*******************************
CREATE TABLE `staffAttendance` (
  `attendanceId` int(11) NOT NULL AUTO_INCREMENT,
  `staffId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `attendanceDate` date NOT NULL,
  `attendance` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendanceId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
*******************************
CREATE TABLE `studentNoticeDetails` (
  `noticeId` int(11) NOT NULL AUTO_INCREMENT,
  `accountId` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `noticeDate` date NOT NULL,
  `studentNotice` text NOT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`noticeId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
*********************************
CREATE TABLE `studentDetails` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `studentId` int(11) NOT NULL,
  `accountId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `motherFirstName` varchar(255) NOT NULL,
  `motherLastName` varchar(255) NOT NULL,
  `motherCellNumber` varchar(255) NOT NULL,
  `motherAAdharNumber` varchar(255) NOT NULL,
  `motherOccupation` varchar(255) NOT NULL,
  `motherQualification` varchar(255) NOT NULL,
  `motherImage` text DEFAULT NULL,
  `fatherFirstName` varchar(255) NOT NULL,
  `fatherLastName` varchar(255) NOT NULL,
  `fatherCellNumber` varchar(255) NOT NULL,
  `fatherAAdharNumber` varchar(255) NOT NULL,
  `fatherOccupation` varchar(255) NOT NULL,
  `fatherQualification` varchar(255) NOT NULL,
  `fatherImage` text DEFAULT NULL,
  `localGuardianFirstName` varchar(255) DEFAULT NULL,
  `localGuardianLastName` varchar(255) DEFAULT NULL,
  `localGuardianCellNumber` varchar(255) DEFAULT NULL,
  `guardianAAdharNumber` varchar(255) NOT NULL,
  `guardianImage` text DEFAULT NULL,
  `sibling` int(11) DEFAULT NULL, 
  `siblingDetails` text DEFAULT NULL, 
  `addressProof` text DEFAULT NULL,
  `isStaffChild` int(11) NOT NULL, 
  `physicalDisability` int(11) NOT NULL,
  `physicalDisabilityDetails` text DEFAULT NULL,
  `studentBloodGroup` int(11) NOT NULL,
  `studentBodyWeight` int(11) NOT NULL,
  `currentTreatment` int(11) NOT NULL,
  `currentTreatmentDetails` text DEFAULT NULL,
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1
******************
alter table userDetails
ADD COLUMN workExperience int default 0 after qualification;

alter table userDetails
ADD COLUMN educationalAwards int default 0 after workExperience;

alter table userDetails
ADD COLUMN awardDetails varchar(255) default null after educationalAwards;
*******************

ALTER TABLE `edusamadhan`.`refreshTokenPortal` 
CHANGE COLUMN `accessToken` `accessToken` TEXT NOT NULL ;
*********************
ALTER TABLE `edusamadhan`.`userDetails` 
CHANGE COLUMN `mediumType` `mediumType` INT NULL ;

****************
insert into account (accountId, accountName,accountRefNumber, accountAdmin, accountStatus, phoneNumber, parentAccountId) values
 ('f1a220da-5d53-11eb-ae93-0242ac130002','7339b6d9313e1f792f5a4177087dc933', 'ac7ea669ab8b28083c3238fa54778f22', '4c0334b0b9161944245db6df7b5a5f2b', 1,'7339b6d9313e1f792f5a4177087dc933', 0);

