CREATE TABLE `account` (
  `accountid` text,
  `accountname` text,
  `accountrefnumber` text,
  `accountaddress` text,
  `accountype` int(11) DEFAULT NULL,
  `accountAdmin` int(11) DEFAULT NULL,
  `createddatetime` text,
  `modifieddatetime` text,
  `status` int(11) DEFAULT NULL,
  `accountstatus` int(11) DEFAULT NULL,
  `parentaccountid` text,
  `accountcategory` int(11) DEFAULT NULL,
  `configid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1


CREATE TABLE `attendance` (
  `idattendanceid` int(11) NOT NULL AUTO_INCREMENT,
  `studentid` int(11) DEFAULT NULL,
  `teacherid` int(11) DEFAULT NULL,
  `january` int(11) DEFAULT NULL,
  `jtd` int(11) DEFAULT NULL,
  `jpd` int(11) DEFAULT NULL,
  `february` int(11) DEFAULT NULL,
  `ftd` int(11) DEFAULT NULL,
  `fpd` int(11) DEFAULT NULL,
  `march` int(11) DEFAULT NULL,
  `mtd` int(11) DEFAULT NULL,
  `mpd` int(11) DEFAULT NULL,
  `april` int(11) DEFAULT NULL,
  `atd` int(11) DEFAULT NULL,
  `apd` int(11) DEFAULT NULL,
  `may` int(11) DEFAULT NULL,
  `matd` int(11) DEFAULT NULL,
  `mapd` int(11) DEFAULT NULL,
  `june` int(11) DEFAULT NULL,
  `juntd` int(11) DEFAULT NULL,
  `junpd` int(11) DEFAULT NULL,
  `july` int(11) DEFAULT NULL,
  `jultd` int(11) DEFAULT NULL,
  `julpd` int(11) DEFAULT NULL,
  `august` int(11) DEFAULT NULL,
  `autd` int(11) DEFAULT NULL,
  `aupd` int(11) DEFAULT NULL,
  `september` int(11) DEFAULT NULL,
  `std` int(11) DEFAULT NULL,
  `spd` int(11) DEFAULT NULL,
  `october` int(11) DEFAULT NULL,
  `otd` int(11) DEFAULT NULL,
  `opd` int(11) DEFAULT NULL,
  `november` int(11) DEFAULT NULL,
  `ntd` int(11) DEFAULT NULL,
  `npd` int(11) DEFAULT NULL,
  `december` int(11) DEFAULT NULL,
  `dtd` int(11) DEFAULT NULL,
  `dpd` int(11) DEFAULT NULL,
  `session` int(11) DEFAULT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idattendanceid`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=latin1

CREATE TABLE `authentication` (
  `id` int(11) DEFAULT NULL,
  `studentid` int(11) DEFAULT NULL,
  `accesstoken` text,
  `clientid` text,
  `expires` int(11) DEFAULT NULL,
  `createddatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `config` (
  `configid` int(11) NOT NULL AUTO_INCREMENT,
  `configdata` json DEFAULT NULL,
  `createddatetime` text,
  `modifieddatetime` text,
  PRIMARY KEY (`configid`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=latin1

CREATE TABLE `entrancequestion` (
  `qid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` varchar(255) DEFAULT NULL,
  `question` text,
  `optiona` text,
  `optionb` text,
  `optionc` text,
  `optiond` text,
  `optione` text,
  `answer` int(11) DEFAULT NULL,
  `class` int(11) DEFAULT NULL,
  `subject` int(11) DEFAULT NULL,
  PRIMARY KEY (`qid`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=latin1

CREATE TABLE `entranceresult` (
  `identranceresult` int(11) NOT NULL AUTO_INCREMENT,
  `studentid` int(11) DEFAULT NULL,
  `teacherid` int(11) DEFAULT NULL,
  `totalmarks` int(11) DEFAULT NULL,
  `obtainedmarks` int(11) DEFAULT NULL,
  `status` text,
  PRIMARY KEY (`identranceresult`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=latin1

CREATE TABLE `expensedetails` (
  `expensedetailsid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` varchar(255) NOT NULL,
  `userid` int(11) NOT NULL,
  `expense` varchar(255) NOT NULL,
  `expenseamount` int(11) NOT NULL,
  `expensedate` text NOT NULL,
  `session` int(11) NOT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`expensedetailsid`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1

CREATE TABLE `feestructure` (
  `feestructureid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` text,
  `class` int(11) DEFAULT NULL,
  `session` int(11) DEFAULT NULL,
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
  PRIMARY KEY (`feestructureid`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=latin1

CREATE TABLE `monthlyattendance` (
  `attendanceid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` varchar(225) NOT NULL,
  `teacherid` int(11) NOT NULL,
  `studentid` int(11) NOT NULL,
  `session` int(11) NOT NULL,
  `classid` int(11) NOT NULL,
  `section` int(11) NOT NULL,
  `january` varchar(255) DEFAULT NULL,
  `february` varchar(255) DEFAULT NULL,
  `march` varchar(255) DEFAULT NULL,
  `april` varchar(255) DEFAULT NULL,
  `may` varchar(255) DEFAULT NULL,
  `june` varchar(255) DEFAULT NULL,
  `july` varchar(255) DEFAULT NULL,
  `august` varchar(255) DEFAULT NULL,
  `september` varchar(255) DEFAULT NULL,
  `october` varchar(255) DEFAULT NULL,
  `november` varchar(255) DEFAULT NULL,
  `december` varchar(255) DEFAULT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT NULL,
  PRIMARY KEY (`attendanceid`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1

CREATE TABLE `password_changerequest` (
  `token` varchar(100) NOT NULL,
  `userid` int(11) NOT NULL,
  `initiatedby` int(11) NOT NULL,
  `createddatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiredatetime` datetime NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `periods` (
  `periodid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` varchar(225) NOT NULL,
  `userid` int(11) NOT NULL,
  `session` int(11) NOT NULL,
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
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`periodid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1

CREATE TABLE `refreshTokenPortal` (
  `userid` int(11) NOT NULL,
  `refreshToken` varchar(100) NOT NULL,
  `accessToken` varchar(500) NOT NULL,
  `createddatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifieddatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`refreshToken`),
  KEY `userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1


CREATE TABLE `result` (
  `studentid` int(11) DEFAULT NULL,
  `teacherid` int(11) DEFAULT NULL,
  `examinationtype` int(11) DEFAULT NULL,
  `math` int(11) DEFAULT NULL,
  `mathobtainmarks` int(11) DEFAULT NULL,
  `science` int(11) DEFAULT NULL,
  `scienceobtainmarks` int(11) DEFAULT NULL,
  `hindi` int(11) DEFAULT NULL,
  `hindiobtainmarks` text,
  `english` int(11) DEFAULT NULL,
  `englishobtainmarks` text,
  `physics` int(11) DEFAULT NULL,
  `physcisobtainmarks` text,
  `chemistry` int(11) DEFAULT NULL,
  `chemistryobtainmarks` text,
  `history` int(11) DEFAULT NULL,
  `historyobtainmarks` text,
  `geography` int(11) DEFAULT NULL,
  `geographyobtainmarks` int(11) DEFAULT NULL,
  `session` int(11) DEFAULT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `schooladmin` (
  `schooladminid` text,
  `schoolname` text,
  `firstname` text,
  `lastname` text,
  `emailid` text,
  `cellnumber` text,
  `password` text,
  `createddatetime` text,
  `modifieddatetime` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `schoolevents` (
  `eventid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` text NOT NULL,
  `userid` int(11) NOT NULL,
  `session` int(11) DEFAULT NULL,
  `eventname` text NOT NULL,
  `eventtype` int(11) DEFAULT NULL,
  `eventData` text NOT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`eventid`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1

CREATE TABLE `schoolnotifications` (
  `notificationid` int(11) NOT NULL AUTO_INCREMENT,
  `notificationuser` int(11) DEFAULT NULL,
  `accountid` text NOT NULL,
  `userid` int(11) NOT NULL,
  `createdby` int(11) DEFAULT NULL,
  `session` int(11) DEFAULT NULL,
  `notificationsubject` text NOT NULL,
  `notificationcreateddate` text NOT NULL,
  `notificationdescription` text NOT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificationid`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1

CREATE TABLE `studentfee` (
  `studentfeeid` int(11) NOT NULL AUTO_INCREMENT,
  `adharnumber` varchar(225) NOT NULL,
  `session` int(11) DEFAULT NULL,
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
  PRIMARY KEY (`studentfeeid`),
  UNIQUE KEY `adharnumber_UNIQUE` (`adharnumber`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=latin1

CREATE TABLE `studentresult` (
  `studentid` int(11) NOT NULL,
  `teacherid` int(11) DEFAULT NULL,
  `examinationtype` int(11) DEFAULT NULL,
  `session` int(11) DEFAULT NULL,
  `hindi` varchar(100) DEFAULT NULL,
  `english` varchar(100) DEFAULT NULL,
  `mathematics` varchar(100) DEFAULT NULL,
  `science` varchar(100) DEFAULT NULL,
  `socialscience` varchar(100) DEFAULT NULL,
  `geography` varchar(100) DEFAULT NULL,
  `physics` varchar(100) DEFAULT NULL,
  `chemistry` varchar(100) DEFAULT NULL,
  `biology` varchar(100) DEFAULT NULL,
  `moralscience` varchar(100) DEFAULT NULL,
  `drawing` varchar(100) DEFAULT NULL,
  `computer` varchar(100) DEFAULT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `student_teacher` (
  `accountid` int(11) NOT NULL AUTO_INCREMENT,
  `teacherid` int(11) DEFAULT NULL,
  `studentid` int(11) DEFAULT NULL,
  `createddatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`accountid`)
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=latin1

CREATE TABLE `subjects` (
  `subjectid` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) DEFAULT NULL,
  `class` int(11) DEFAULT NULL,
  `subjects` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`subjectid`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=latin1

CREATE TABLE `teacher_principal` (
  `accountid` text,
  `userid` int(11) DEFAULT NULL,
  `createddatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `timetable` (
  `timetableid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` varchar(225) NOT NULL,
  `userid` int(11) NOT NULL,
  `class` int(11) NOT NULL,
  `section` int(11) NOT NULL,
  `session` int(11) NOT NULL,
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
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`timetableid`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1

CREATE TABLE `transportfee` (
  `transportfeeid` int(11) NOT NULL AUTO_INCREMENT,
  `accountid` varchar(100) NOT NULL,
  `userid` int(11) NOT NULL,
  `route` varchar(225) NOT NULL,
  `fee` int(11) NOT NULL,
  `vehiclenumber` varchar(100) NOT NULL,
  `drivername` varchar(100) NOT NULL,
  `drivernumber` varchar(100) NOT NULL,
  `driversalary` int(11) NOT NULL,
  `vehicletype` int(11) NOT NULL,
  `vehiclecolor` varchar(50) NOT NULL,
  `vehicleexpense` int(11) NOT NULL,
  `session` int(11) NOT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transportfeeid`),
  UNIQUE KEY `vehiclenumber_UNIQUE` (`vehiclenumber`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1

CREATE TABLE `userdetails` (
  `userid` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` text NOT NULL,
  `lastname` text NOT NULL,
  `cellnumber` text NOT NULL,
  `adharnumber` varchar(255) NOT NULL,
  `dob` text,
  `emailid` varchar(255) DEFAULT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `status` int(11) DEFAULT NULL,
  `userrole` int(11) NOT NULL,
  `permissionlevel` int(11) DEFAULT NULL,
  `gender` text,
  `wrongpasswordcount` int(11) DEFAULT NULL,
  `passwordchangecount` int(11) DEFAULT NULL,
  `localaddress` text,
  `parmanentaddress` text,
  `classid` int(11) DEFAULT NULL,
  `section` int(11) DEFAULT NULL,
  `session` int(11) DEFAULT NULL,
  `images` text,
  `mothername` text,
  `fathername` text,
  `religion` int(11) DEFAULT NULL,
  `category` int(11) DEFAULT NULL,
  `locality` int(11) DEFAULT NULL,
  `subject` int(11) DEFAULT NULL,
  `qualification` int(11) DEFAULT NULL,
  `busservice` int(11) DEFAULT NULL,
  `route` int(11) DEFAULT NULL,
  `salary` varchar(100) DEFAULT NULL,
  `createddatetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddatetime` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `adharnumber_UNIQUE` (`adharnumber`),
  UNIQUE KEY `emailid_UNIQUE` (`emailid`)
) ENGINE=InnoDB AUTO_INCREMENT=463 DEFAULT CHARSET=latin1

CREATE TABLE `examresult` (
  `examresult` int(11) NOT NULL AUTO_INCREMENT,
  `studentid` int(11) NOT NULL,
  `teacherid` int(11) NOT NULL,
  `examinationtype` int(11) NOT NULL,
  `session` int(11) NOT NULL,
  `subjectResultArray` JSON NOT NULL,
  `createddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifieddate` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`examresult`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
