CREATE DEFINER=`adminanuj`@`%` PROCEDURE `CSP_CreateResult`(
v_studentid int,
v_teacherid int,
v_maths int,
v_science int, 
v_hindi int, 
v_english int, 
v_physics int, 
v_chemistry int, 
v_history int, 
v_totalMarks int,
v_sum int,
v_persentage float)
BEGIN
insert into result(studentid, teacherid, math, science, hindi, english, physics, chemistry, history, totalMarks, obtainedmarks, persentage) values
(v_studentid, v_teacherid, v_maths, v_science, v_hindi, v_english, v_physics, v_chemistry, v_history, v_totalMarks , v_sum, v_persentage);

END

**********************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `CSP_UnlockTeacher`(v_userid int)
BEGIN 
update userdetails set status = 1, wrongpasswordcount = 0 where userid = v_userid;
IF row_count() = 1 THEN
SELECT TRUE as result;
ELSE
SELECT FALSE as result;
END IF;
END

*******************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `CSP_UpdateStudentData`(
		v_studentid int,
        v_fname text,
		v_lname text,
		v_mname text,
		v_faname text,
		v_cellnumber text,
		v_dob text,
		v_gender text,
		v_religion text,
        v_category text,
        v_locality text,
        v_locaddress text,
        v_paraddress text,
        v_teacherid text,
        v_classid text,
        v_section text,
        v_session text,
        v_images text,
        v_busservice int,
        v_route int
        )
BEGIN
 UPDATE userdetails set firstname = v_fname, lastname = v_lname, mothername = v_mname, fathername = v_faname, cellnumber = v_cellnumber, 
 dob = v_dob, gender = v_gender, religion = v_religion, category = v_category, locality = v_locality, localaddress = v_locaddress, parmanentaddress = v_paraddress, images = v_images, busservice = v_busservice, route = v_route where userid = v_studentid and classid = v_classid and section = v_section and session = v_session;
 END

 ***********************
 CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_Attendance`(v_teacherid int)
BEGIN
select * from attendance where teacherid = v_teacherid;
END

****************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_Attendances`(v_teacherid int, v_studentid int, v_session int)
BEGIN
select * from attendance where teacherid = v_teacherid and studentid = v_studentid and session = v_session;
END

************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreateEntrance`(
	
        v_fname text,
		v_lname text,
		v_cellno text,
        v_username text,
        v_password text,
        v_adharnumber text,
		v_dob text,
        v_class int,
        v_status int,
        v_userrole int,
        v_section int
		)
BEGIN 
DECLARE __id integer;
DECLARE exit handler for sqlexception , sqlwarning
BEGIN 
    -- ERROR
    
ROLLBACK; 
RESIGNAL;
    
END;
  START TRANSACTION;
  -- insert into patient table 
INSERT INTO  userdetails(firstname,lastname,dob,cellnumber,username,password,userrole,classid, status, adharnumber, section) values(v_fname,v_lname,v_dob,v_cellno,v_username,v_password,v_userrole,v_class,v_status, v_adharnumber,v_section);
SET __id:= LAST_INSERT_ID();
SELECT __id AS userid;

COMMIT;
END

************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreateEntranceQuestion`(
v_question text,
v_optiona text,
v_optionb text,
v_optionc text,
v_optiond text,
v_optione text,
v_answer text,
v_class text,
v_subject text,
v_accountid text
)
BEGIN
insert into entrancequestion(question,optiona,optionb,optionc,optiond,optione,answer,class,subject,accountid)
values(v_question,v_optiona,v_optionb,v_optionc,v_optiond,v_optione,v_answer,v_class,v_subject,v_accountid);
END

***********************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreateEntranceResult`(
v_studentid text,
v_teacherid text,
v_totalmarks text,
v_obtainedmarks text,
v_status text
)
BEGIN
insert into entranceresult(studentid,teacherid,totalmarks,obtainedmarks,status)
values(v_studentid,v_teacherid,v_totalmarks,v_obtainedmarks,v_status);
END

***********************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreateFeeStructure`(
        v_accountid text,
		v_class text,
		v_session text,
        v_january text,
		v_february text,
        v_march text,
        v_april text,
        v_may text,
		v_june text,
        v_july text,
        v_august text,
        v_september text,
        v_october text,
        v_november text,
        v_december text
)
BEGIN
INSERT INTO  feestructure(accountid, class, session, january, february, march, april, may, june, july, august, september, october, november, december) 
values(v_accountid, v_class, v_session, v_january, v_february, v_march, v_april, v_may, v_june, v_july, v_august, v_september, v_october, v_november, v_december);
END

**********************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreatePrescription`(
	
        v_fname text,
		v_lname text,
		v_mname text,
        v_faname text,
		v_cellno text,
        v_username text,
        v_password text,
        v_st text,
		v_dob text,
        v_adharcard text,
        v_gender text,
        v_religion text,
        v_category text,
        v_locality text,
        v_locaddress text,
        v_paraddress text,
        v_class text,
        v_section text,
		v_session text,
        v_status text,
        v_images text,
        v_busservice int,
        v_route int
		)
BEGIN 
DECLARE __id integer;
DECLARE exit handler for sqlexception , sqlwarning
BEGIN 
    -- ERROR
    
ROLLBACK; 
RESIGNAL;
    
END;
  START TRANSACTION;
  -- insert into patient table 
INSERT INTO  userdetails(firstname,lastname,dob,cellnumber,username,password,userrole,mothername,fathername,adharnumber,gender,religion,category,locality,localaddress,parmanentaddress,classid,section,session,status,images, busservice, route) 
values(v_fname,v_lname,v_dob,v_cellno,v_username,v_password,v_st,v_mname,v_faname,v_adharcard,v_gender,v_religion,v_category,v_locality,v_locaddress,v_paraddress,v_class,v_section,v_session,v_status,v_images, v_busservice, v_route);
SET __id:= LAST_INSERT_ID();
SELECT __id AS  userid;

COMMIT;
END

********************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreateTeacher`(
        v_fname text,
		v_lname text,
        v_emailid text,
        v_username text,
        v_password text,
        v_cell text,
		v_dob text,
        v_gender text,
        v_userrole text,
		v_adharcard text,
        v_qualification text,
        v_subject text,
        v_locaddress text,
        v_paraddress text,
		v_session text,
        v_status text,
        v_images text,
        v_claasid text,
        v_section text,
        v_salary text
		)
BEGIN 
DECLARE __id integer;
DECLARE exit handler for sqlexception , sqlwarning
BEGIN 
    -- ERROR
    
ROLLBACK; 
RESIGNAL;
    
END;
  START TRANSACTION;
  -- insert into patient table 
INSERT INTO  userdetails(firstname,lastname,emailid,username,password,cellnumber,dob,gender,userrole,adharnumber,qualification, subject,localaddress,parmanentaddress,session,status,images,classid,section,salary) 
values(v_fname,v_lname,v_emailid,v_username,v_password,v_cell,v_dob,v_gender,v_userrole,v_adharcard,v_qualification,v_subject,v_locaddress,v_paraddress,v_session,v_status,v_images,v_claasid,v_section,v_salary);
SET __id:= LAST_INSERT_ID();
SELECT __id AS  userid;

COMMIT;
END

************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_DeleteEntranceQuestion`( v_questionid text, v_accountid text )
BEGIN
 delete from entrancequestion where qid = v_questionid and accountid = v_accountid;
 END

 ***********************
 CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetAttendance`(v_teacherid int)
BEGIN
select * from attendance where teacherid = v_teacherid;
END

**************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetPatientlist`(IN v_class text, v_section text, v_session text, v_userid text)
BEGIN 
select * from userdetails where classid = v_class and section = v_section  and userid IN(select studentid from student_teacher where teacherid = v_userid);
END

**************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetProviderDetails`(v_hashedemail text)
BEGIN 
select * from useretails where hashedemail = v_hashedemail ;
END

***********************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetQuestionByClass`(v_classid text)
BEGIN
select * from entrancequestion where class = v_classid;
 END

*************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetQuestionForEdit`(v_accountid text, v_questionid text)
BEGIN
select * from entrancequestion where (accountid = v_accountid and qid = v_questionid);
END 

*************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetQuestionForEntrance`(v_teacherid text, v_classid text)
BEGIN
select * from entrancequestion where (userid = v_teacherid and class = v_classid);
END

**************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetResult`(v_teacherid int)
BEGIN
select * from studentresult where teacherid = v_teacherid;
END

**************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetResults`(v_teacherid int, v_studentid int, v_sessionid int, v_examtype int)
BEGIN
select * from result where  teacherid = v_teacherid and studentid = v_studentid and session = v_sessionid and examinationtype = v_examtype;
END

**************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetStudentdetails`(v_studentid text)
BEGIN
select * from userdetails where userid = v_studentid;
END

**************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_GetStusentsForExamhead`(v_teacherid text, v_classid text)
BEGIN
select s.userid,s.firstname, s.lastname, s.cellnumber, s.dob, e.totalmarks, e.obtainedmarks, e.status from 
		userdetails as s
inner join 
		entranceresult as e
ON s.userid = e.studentid  	

where s.userid IN(select studentid from student_teacher where teacherid = v_teacherid);
END

***************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_pramoteStudent`( v_studentid text, v_teacherid text, v_classteacherid text)
BEGIN
 update student set teacherid = v_classteacherid, section = 1, studenttype =1 where studentid = v_studentid and teacherid = v_teacherid ;
 END

****************************
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_UpdateEntranceQuestion`(
		v_question text,
v_optiona text,
v_optionb text,
v_optionc text,
v_optiond text,
v_optione text,
v_answer text,
v_class text,
v_subject text,
v_accountid text,
v_questionid text)
BEGIN
 UPDATE entrancequestion set question = v_question, optiona = v_optiona, optionb = v_optionb, optionc = v_optionc, optiond = v_optiond,
 optione = v_optione, answer = v_answer, class = v_class, subject = v_subject where accountid = v_accountid and qid = v_questionid;
 
 END

 *******************
 added mediumType

 USE `schooldb`;
DROP procedure IF EXISTS `SQSP_CreateFeeStructure`;

DELIMITER $$
USE `schooldb`$$
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreateFeeStructure`(
        v_accountid text,
		v_class text,
        v_mediumType text,
		v_session text,
        v_january text,
		v_february text,
        v_march text,
        v_april text,
        v_may text,
		v_june text,
        v_july text,
        v_august text,
        v_september text,
        v_october text,
        v_november text,
        v_december text
)
BEGIN
INSERT INTO  feestructure(accountid, class, mediumType, session, january, february, march, april, may, june, july, august, september, october, november, december) 
values(v_accountid, v_class, v_mediumType, v_session, v_january, v_february, v_march, v_april, v_may, v_june, v_july, v_august, v_september, v_october, v_november, v_december);

END$$

DELIMITER ;
*******************
Create student
USE `schooldb`;
DROP procedure IF EXISTS `SQSP_CreatePrescription`;

DELIMITER $$
USE `schooldb`$$
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `SQSP_CreatePrescription`(
	
        v_fname text,
		v_lname text,
		v_mname text,
        v_faname text,
		v_cellno text,
        v_username text,
        v_password text,
        v_st text,
		v_dob text,
        v_adharcard text,
        v_gender text,
        v_religion text,
        v_category text,
        v_locality text,
		v_mediumType text,
        v_locaddress text,
        v_paraddress text,
        v_class text,
        v_section text,
		v_session text,
        v_status text,
        v_images text,
        v_busservice int,
        v_route int
		)
BEGIN 
DECLARE __id integer;
DECLARE exit handler for sqlexception , sqlwarning
BEGIN 
    -- ERROR
    
ROLLBACK; 
RESIGNAL;
    
END;
  START TRANSACTION;
  -- insert into patient table 
INSERT INTO  userdetails(firstname,lastname,dob,cellnumber,username,password,userrole,mothername,fathername,adharnumber,gender,religion,category,locality,mediumType,localaddress,parmanentaddress,classid,section,session,status,images, busservice, route) 
values(v_fname,v_lname,v_dob,v_cellno,v_username,v_password,v_st,v_mname,v_faname,v_adharcard,v_gender,v_religion,v_category,v_locality, v_mediumType, v_locaddress,v_paraddress,v_class,v_section,v_session,v_status,v_images, v_busservice, v_route);
SET __id:= LAST_INSERT_ID();
SELECT __id AS  userid;

COMMIT;
END$$

DELIMITER ;

********************
USE `schooldb`;
DROP procedure IF EXISTS `CSP_UpdateStudentData`;

DELIMITER $$
USE `schooldb`$$
CREATE DEFINER=`adminanuj`@`%` PROCEDURE `CSP_UpdateStudentData`(
		v_studentid int,
        v_fname text,
		v_lname text,
		v_mname text,
		v_faname text,
		v_cellnumber text,
		v_dob text,
		v_gender text,
		v_religion text,
        v_category text,
        v_locality text,
		v_mediumType text,
        v_locaddress text,
        v_paraddress text,
        v_teacherid text,
        v_classid text,
        v_section text,
        v_session text,
        v_images text,
        v_busservice int,
        v_route int
        )
BEGIN
 UPDATE userdetails set firstname = v_fname, lastname = v_lname, mothername = v_mname, fathername = v_faname, cellnumber = v_cellnumber, 
 dob = v_dob, gender = v_gender, religion = v_religion, category = v_category, locality = v_locality, mediumType = v_mediumType, localaddress = v_locaddress, parmanentaddress = v_paraddress, images = v_images, busservice = v_busservice, route = v_route where userid = v_studentid and classid = v_classid and section = v_section and session = v_session;
 
 END$$

DELIMITER ;


