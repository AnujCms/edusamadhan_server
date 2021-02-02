const router = require('express').Router();
const ExaminationDB = require("../database/ExaminationDB");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/examination.js');
const middleWare = require('../apiJoi/middleWare.js');
const _ = require('lodash');
const encrypt = require('../utils/encrypt');

function isExaminationHead(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.ExamHead) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isExaminationStudent(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.EntranceStudent) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isExaminationCompleted(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.EntranceCompleted) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}

//Check User and Student Beelongs to same School
let checkStudentAndUserBelongsToSameSchool = async (req, res, next) =>{
    let result = await ExaminationDB.checkRelationStudentAndUser(req.user.accountId, req.params.studentId || req.body.studentId);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Student and User are not belongs to same account." });
    }  
}
const classIdParams = middleWare(joiSchema.classIdParams, "params", true);
const studentIdParams = middleWare(joiSchema.studentIdParams, "params", true);
const classIdandSectionId = middleWare(joiSchema.classIdandSectionId, "params", true);
const questionIdParams = middleWare(joiSchema.questionIdParams, "params", true);
const entranceObject = middleWare(joiSchema.entranceObject, "body", true);
const studentIdBody = middleWare(joiSchema.studentIdBody, "body", true);
const questionObject = middleWare(joiSchema.questionObject, "body", true);
const resultObject = middleWare(joiSchema.resultObject, "body", true);
const classSeatsObject = middleWare(joiSchema.classSeatsObject, "body", true);


//get students for Exam head
router.get("/entranceStudents/:classId/:sectionId", isExaminationHead, async (req, res) => {
    let userStatus = [UserEnum.StudentStatus.AllowToExam, UserEnum.StudentStatus.ExamCompleted]
    let students = await ExaminationDB.getStudentsForExamhead(req.user.accountId, req.params.classId, req.params.sectionId, userStatus);
    if (students.length > 0) {
        let studentsObj = [];
        students.forEach(function (row) {
            studentsObj.push({
                studentId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                dob: encrypt.decrypt(row.dob),
                totalMarks: row.totalMarks,
                obtainedMarks: row.obtainedMarks,
                status: row.status,
                classId: row.classId,
                userrole: row.userrole,
                sectionId: row.sectionId
            });
        });
        res.status(200).json({ status: 1, students: studentsObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Students are not Registered." });
    }
});

//delete student by Exam Head
router.delete("/deletestudent/:studentId", isExaminationHead, studentIdParams, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let result = await ExaminationDB.deleteStudent(req.params.studentId, req.user.userId);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Student has been deleted successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Student has not been deleted.' })
    }
});

//pramote students by Exam Head
router.put("/pramotestudent/:studentId", isExaminationHead, studentIdParams, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let pramoteObj = {
        studentId: req.params.studentId,
        userrole: UserEnum.UserRoles.Student,
        status: UserEnum.StudentStatus.Pramoted
    }
    let result = await ExaminationDB.pramoteStudent(pramoteObj);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: 'Student has been Promoted successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Student has not been Promoted.' });
    }
});

//get entrance question based on selected class by Exam Head
router.get("/getQuestionForClass/:classId", isExaminationHead, classIdParams, async (req, res) => {
    let result = await ExaminationDB.getClassForEntrance(req.user.accountId, req.params.classId);
    if (result.length > 0) {
        let resultObj = []
        result.forEach(function (row) {
            resultObj.push({
                questionId: row.questionId,
                classId: row.classId,
                question: encrypt.decrypt(row.question),
                optiona: encrypt.decrypt(row.optiona),
                optionb: encrypt.decrypt(row.optionb),
                optionc: encrypt.decrypt(row.optionc),
                optiond: encrypt.decrypt(row.optiond),
                answer: row.answer,
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });

    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the question.' });
    }
})

//entrance Registration
router.post("/entranceRegistration", isExaminationHead, entranceObject, async (req, res) => {
    let student = {
        firstname: encrypt.encrypt(req.body.fname),
        lastname: encrypt.encrypt(req.body.lname),
        cellnumber: encrypt.encrypt(req.body.cellnumber),
        username: encrypt.computeHash(req.body.adharnumber),
        password: encrypt.getHashedPassword(req.body.adharnumber),
        adharnumber: req.body.adharnumber,
        dob: encrypt.encrypt(req.body.dob),
        classid: req.body.class,
        section: req.body.section,
        status: UserEnum.UserStatus.Active,
        userrole: UserEnum.UserRoles.EntranceStudent
    }
    let result
    if (req.body.studentId) {
        result = await ExaminationDB.updateEntranceStudent(studentObject, req.body.studentId, req.user.userid);
    } else {
        result = await ExaminationDB.saveStusentEntrance(student, req.user.userid);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.studentId ? 'Student record has been updated successfully.' : 'Student has been registered successfully.' })
    } else {
        res.status(400).json({ status: 0, statusDescription: 'Student registration not completed.' })
    }
});
//get student for update for edit
router.get("/getstudentforedit/:studentId", isExaminationHead, studentIdParams, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let result = await ExaminationDB.getStudentForEdit(req.user.userId, req.params.studentId);
    if (result.length > 0) {
        let resultObj = []
        result.forEach((row) => {
            resultObj.push({
                class: row.classid,
                firstname: encrypt.decrypt(row.firstname),
                lastname: encrypt.decrypt(row.lastname),
                dob: encrypt.decrypt(row.dob),
                cellnumber: encrypt.decrypt(row.cellnumber),
                adharnumber: row.adharnumber,
                section: row.section
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to fetch the data.' });
    }
})

//update re exam entrance
router.put("/reexamentrance", isExaminationHead, studentIdBody, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let result = await ExaminationDB.updateEntranceUserrole(req.body.studentId, UserEnum.UserRoles.EntranceStudent, UserEnum.StudentStatus.AllowToExam);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Student allowed for Re-Exam.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Student status not updated.' });
    }
});

//Create Entrance Questions
router.post("/createEntranceQuestion", isExaminationHead, questionObject, async (req, res) => {
    let questionObject = {
        question: encrypt.encrypt(req.body.question),
        optiona: encrypt.encrypt(req.body.optiona),
        optionb: encrypt.encrypt(req.body.optionb),
        optionc: encrypt.encrypt(req.body.optionc),
        optiond: encrypt.encrypt(req.body.optiond),
        optione: encrypt.encrypt(req.body.optione),
        answer: req.body.answer,
        classId: req.body.classId,
        subjectId: req.body.subjectId,
        accountId: req.user.accountId
    }
    let result
    if (req.body.questionId) {
        questionObject.questionId = req.body.questionId;
        result = await ExaminationDB.updateEntranceQuestion(questionObject);
    } else {
        result = await ExaminationDB.saveEntranceQuestion(questionObject);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.questionId? 'Question has been updated successfully.': 'Quastion has been created successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Quastion not created.' });
    }
});

//get question for edit
router.get("/getQuestionForEdit/:questionId", isExaminationHead, questionIdParams, async (req, res) => {
    let result = await ExaminationDB.getQuestionForEdit(req.user.accountId, req.params.questionId);
    if (result.length > 0) {
        let questionObj = [];
        result.forEach((row) => {
            questionObj.push({
                questionId: row.questionId,
                question: encrypt.decrypt(row.question),
                optiona: encrypt.decrypt(row.optiona),
                optionb: encrypt.decrypt(row.optionb),
                optionc: encrypt.decrypt(row.optionc),
                optiond: encrypt.decrypt(row.optiond),
                optione: encrypt.decrypt(row.optione),
                answer: row.answer,
                classId: row.classId,
                subjectId: row.subjectId
            })
        })
        res.status(200).json({ status: 1, statusDescription: questionObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to fetch the data.' });
    }
})

//Delete question by Exam Head
router.delete("/deleteQuestion/:questionId", isExaminationHead, questionIdParams, async (req, res) => {
    let result = await ExaminationDB.deleteEntranceQuestion(req.params.questionId, req.user.accountId);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Question has been deleted successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to delete the question.' });
    }
});

//get entrance question for student
router.get("/getQuestionForEntrance", isExaminationStudent, async (req, res) => {
    let result = await ExaminationDB.getQuestionForEntrance(req.user.userId, req.user.accountId);
    if (result.length > 0) {
        let resultObj = []
        result.forEach((row) => {
            resultObj.push({
                qid: row.qid,
                class: row.class,
                question: encrypt.decrypt(row.question),
                optiona: encrypt.decrypt(row.optiona),
                optionb: encrypt.decrypt(row.optionb),
                optionc: encrypt.decrypt(row.optionc),
                optiond: encrypt.decrypt(row.optiond),
                answer: row.answer,
                subject: row.subject
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the class" });
    }
})

//Insert entrance result
router.post("/createEntranceResult", isExaminationStudent, resultObject, async (req, res) => {
    let resultObj = {
        studentId: req.user.userId,
        totalMarks: req.body.totalMarks,
        obtainedMarks: req.body.obtainedMarks
    }
    const r = Math.round((resultObj.obtainedmarks * 100) / resultObj.totalmarks);
    if (r >= 60) {
        resultObj.resultStatus = 1
    } else { resultObj.resultStatus = 2 }
    let results = await ExaminationDB.insertEntranceResult(resultObj, UserEnum.UserRoles.EntranceCompleted, UserEnum.StudentStatus.ExamCompleted);
    if (results == 1) {
        res.status(200).json({ status: 1, statusDescription: "Exam completed." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save the reqult." });
    }
})
router.get("/getEntranceResult", isExaminationCompleted, async (req, res) => {
    let result = await ExaminationDB.getEntranceCompletedResult(req.user.userId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result[0] });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to fetch the data.' });
    }
})

//save class seat record
router.post("/createclassseats", isExaminationHead, classSeatsObject, async (req, res) => {
    const classSeatsObject = {
        userId: req.user.userId,
        accountId: req.user.accountId,
        classId: req.body.classId,
        sectionId: req.body.sectionId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        totalRows: req.body.totalRows,
        totalColumns: req.body.totalColumns,
        totalSeats: req.body.totalSeats,
        isAssigned: 0
    }
    let results = false;
    if(req.body.classSeatId){
        classSeatsObject.classSeatId = req.body.classSeatId;
        results = await ExaminationDB.updateClassSeats(classSeatsObject);
    }else{
        results = await ExaminationDB.createClassSeats(classSeatsObject);
    }
    if (results == 1) {
        res.status(200).json({ status: 1, statusDescription:req.body.classSeatId?"Class seats record has been updated successfully.": "Class seats record has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save the data." });
    }
})

//get class seats details
router.get("/getclassseatsdetails", isExaminationHead, async (req, res) => {
    let classSeatObject = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let results = await ExaminationDB.getClassSeatsDetails(classSeatObject);
    if (results) {
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the data." });
    }
})

//get class seats detail For Edit
router.get("/getclassseatsdetails/:classId/:sectionId", isExaminationHead, classIdandSectionId, async (req, res) => {
    let classSeatObject = {
        classId: req.params.classId,
        sectionId: req.params.sectionId,
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let results = await ExaminationDB.getClassSeatsDetailForEdit(classSeatObject);
    if (results.length>0) {
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the data." });
    }
})
//delete class seats details
router.delete("/deleteclassseatsdetails/:classSeatId", isExaminationHead, async (req, res) => {
    let classSeatObject = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        classSeatId: req.params.classSeatId
    }
    let results = await ExaminationDB.deleteClassSeatsDetails(classSeatObject);
    if (results) {
        res.status(200).json({ status: 1, statusDescription: "Record has been deleted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the data." });
    }
})

//save mixed students
router.post("/savemixedstudents", isExaminationHead, async (req, res) => {
    let studentsList = await ExaminationDB.getStudentsList(req.user.accountId, req.body.classArray);
    console.log(studentsList)
if(studentsList.length>0){
    let studentArray = []
    studentsList.map((student)=>{
        let studentObj ={
            studentName: encrypt.decrypt(student.firstName) + " " + encrypt.decrypt(student.lastName),
            studentId: student.userid,
            classId: student.classid,
            aadharNumber: encrypt.decrypt(student.aadharNumber)
        }
        studentArray.push(studentObj)
    })
    const grouped = _.groupBy(studentArray, "classid");
    let separatedArray = Object.keys(grouped).map((key) => grouped[key]);
    let finalMixedStudents = [];
    let overflowStudents = [];
    if(separatedArray.length == 2){
        let firstClassLength = separatedArray[0].length;
        let secondClassLength = separatedArray[1].length;

        let mixedArray = [firstClassLength, secondClassLength]
        let minValue = Math.min(...mixedArray);
        let maxValue = Math.max(...mixedArray);
        if(mixedArray.indexOf(minValue) == 0){
            overflowStudents.push(separatedArray[1].slice(minValue, maxValue))
        }else if(mixedArray.indexOf(minValue) == 1){
            overflowStudents.push(separatedArray[0].slice(minValue, maxValue))
        }

        for (let i = 0; i<minValue; i++ ){
            finalMixedStudents.push(separatedArray[0][i])
            finalMixedStudents.push(separatedArray[1][i])
        }
    }else if(separatedArray.length == 3){
        let firstClassLength = separatedArray[0].length;
        let secondClassLength = separatedArray[1].length;
        let thirdClassLength = separatedArray[2].length;

        let mixedArray = [firstClassLength, secondClassLength, thirdClassLength]
        let minValue = Math.min(...mixedArray);
        let maxValue = Math.max(...mixedArray);
 
        if(mixedArray.indexOf(minValue) == 0){
            overflowStudents.push(separatedArray[1].slice(minValue, maxValue))
            overflowStudents.push(separatedArray[2].slice(minValue, maxValue))
        }else if(mixedArray.indexOf(minValue) == 1){
            overflowStudents.push(separatedArray[0].slice(minValue, maxValue))
            overflowStudents.push(separatedArray[2].slice(minValue, maxValue))
        }else if(mixedArray.indexOf(minValue) == 2){
            overflowStudents.push(separatedArray[0].slice(minValue, maxValue))
            overflowStudents.push(separatedArray[1].slice(minValue, maxValue))
        }

        for (let i = 0; i<minValue; i++ ){
            finalMixedStudents.push(separatedArray[0][i])
            finalMixedStudents.push(separatedArray[1][i])
            finalMixedStudents.push(separatedArray[2][i])
        }
    }
    console.log("overflowStudents", overflowStudents)
    console.log("finalMixedStudents", finalMixedStudents.length)

    let results = false;
    const classObject = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        mixedOptions: req.body.mixedOptions,
        classArray: JSON.stringify(req.body.classArray),
        mixedStudentList: JSON.stringify(finalMixedStudents),
        overFlowStudentList: JSON.stringify(overflowStudents)
    }
    if(req.body.mixedClassStudentId){
        classObject.mixedClassStudentId = req.body.mixedClassStudentId;
        results = await ExaminationDB.updateMixedStudents(classObject);
    }else{
        results = await ExaminationDB.createMixedStudents(classObject);
    }
    if (results == 1) {
        res.status(200).json({ status: 1, statusDescription:req.body.mixedClassStudentId?"Record has been updated successfully.": "Record has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save the data." });
    }
}else{
    res.status(200).json({ status: 0, statusDescription: "Not able to save the data." });
}
})

//get mixed type
router.get("/getmixedtype", isExaminationHead, async (req, res) => {
    let mixedObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let results = await ExaminationDB.getMixedOptions(mixedObj);
    if (results.length>0) {
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the data." });
    }
})

//get mixed students list
router.get("/getmixedstudentslist/:mixedOptions", isExaminationHead, async (req, res) => {
    let mixedObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        mixedOptions: req.params.mixedOptions
    }
    let results = await ExaminationDB.getMixedStudents(mixedObj);
    if (results.length>0) {
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the data." });
    }
})

//save seating arrangement
router.post("/saveseatingarrangement", isExaminationHead, async (req, res) => {
    let seatingArrangementObject = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        classId: req.body.classId,
        sectionId: req.body.sectionId,
        mixedOptions: req.body.mixedType,
        totalColumns: req.body.totalColumns,
        totalRows: req.body.totalRows,
        totalSeats: req.body.totalSeats,
        mixedStudentList: JSON.stringify(req.body.usedStudentsList)
    }
    let mixedClassStudent = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        mixedOptions: req.body.mixedType,
        mixedStudentList: JSON.stringify(req.body.unUsedStudentsList)
    }
    results = await ExaminationDB.saveSeatingArrangement(seatingArrangementObject, mixedClassStudent);
    if (results == 1) {
        res.status(200).json({ status: 1, statusDescription:req.body.classSeatId?"Record has been updated successfully.": "Record has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save the data." });
    }
})

// get seating arrangement
router.get("/getseatingarrangement/:classId/:sectionId", isExaminationHead, classIdandSectionId, async (req, res ) => {
    let getArrangementObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        classId: req.params.classId,
        sectionId: req.params.sectionId
    }
    let results = await ExaminationDB.getSeatingArrangement(getArrangementObj);
    if (results.length>0) {
        res.status(200).json({ status: 1, statusDescription:results });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Seating arrangement not found for this room." });
    }
})

//allow for exam students by Exam Head
router.put("/allowForExam/:studentId", isExaminationHead, studentIdParams, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let examObject = {
        studentId: req.params.studentId,
        userId: req.user.userId,
        accountId: req.user.accountId,
        status: UserEnum.StudentStatus.AllowToExam,
        userrole:UserEnum.UserRoles.EntranceStudent,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let result = await ExaminationDB.allowForExam(examObject);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Student allowed for exam.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Student has not been allowed.' });
    }
});


/**
* @swagger
* paths:
*     /entranceexamservice/entrancestudents/{classId}:
*      get:
*          description: Get Entrance Result
*          tags: [Examination Service]
*          summary: Get Entrance Result, Only accessed by Examination Head 
*          parameters:
*              - in: path
*                name: classId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/deletestudent/{studentId}:
*      delete:
*          description: Delete the student
*          tags: [Examination Service]
*          summary: Delete the student, Only accessed by Examination Head 
*          parameters:
*              - in: path
*                name: studentId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/pramotestudent/{studentId}/{classId}/{sectionId}:
*      put:
*          description: Pramote the student
*          tags: [Examination Service]
*          summary: Pramote the student, Only accessed by Examination Head 
*          parameters:
*              - in: path
*                name: studentId
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: classId
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/getQuestionForClass/{classId}:
*      get:
*          description: Get Questions based on class
*          tags: [Examination Service]
*          summary: Get Questions based on class, Only accessed by Examination Head 
*          parameters:
*              - in: path
*                name: classId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/entranceRegistration:
*         post:
*             description: Entrance Registration
*             tags: [Examination Service]
*             summary: "Student Registration, only accessed by Examination Head"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 fname:
*                                     type: string
*                                 lname:
*                                     type: string
*                                 cellnumber:
*                                     type: string
*                                 adharnumber:
*                                     type: string
*                                 dob:
*                                     type: string
*                                 class:
*                                     type: string
*                                 section:
*                                     type: string
*                                 studentId:
*                                     type: number
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /entranceexamservice/getstudentforedit/{studentId}:
*      get:
*          description: Get Student Detail for edit
*          tags: [Examination Service]
*          summary: Get Student Detail for edit, Only accessed by Examination Head 
*          parameters:
*              - in: path
*                name: studentId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/reexamentrance:
*         put:
*             description: Allow for Re-Examination
*             tags: [Examination Service]
*             summary: "Allow for Re-Examination, only accessed by Examination Head"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 studentid:
*                                     type: number
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /entranceexamservice/entranceQuestion:
*         post:
*             description: Entrance Registration
*             tags: [Examination Service]
*             summary: "Student Registration, only accessed by Examination Head"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 question:
*                                     type: string
*                                 optiona:
*                                     type: string
*                                 optionb:
*                                     type: string
*                                 optionc:
*                                     type: string
*                                 optiond:
*                                     type: string
*                                 optione:
*                                     type: string
*                                 answer:
*                                     type: string
*                                 class:
*                                     type: number
*                                 subject:
*                                     type: number
*                                 questionId:
*                                     type: number
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /entranceexamservice/getquestionforedit/{questionId}:
*      get:
*          description: Get Question Detail for edit
*          tags: [Examination Service]
*          summary: Get Question Detail for edit, Only accessed by Examination Head 
*          parameters:
*              - in: path
*                name: questionId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/deleteQuestion/{questionId}:
*      delete:
*          description: Delete the question
*          tags: [Examination Service]
*          summary: Delete the question, Only accessed by Examination Head 
*          parameters:
*              - in: path
*                name: questionId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/getclassforquestion:
*      get:
*          description: Get questions for Student
*          tags: [Examination Service]
*          summary: Get questions for Student
*          parameters:
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/createEntranceResult:
*         post:
*             description: Create Entrance Result
*             tags: [Examination Service]
*             summary: "Create Entrance Result, only accessed by Examination Head"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 totalmarks:
*                                     type: number
*                                 obtainedmarks:
*                                     type: number
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /entranceexamservice/getEntranceResult:
*      get:
*          description: Get entrance result
*          tags: [Examination Service]
*          summary: Get entrance result
*          parameters:
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /entranceexamservice/updateProfileDetails:
*         post:
*             description: Update Profile of Student
*             tags: [Examination Service]
*             summary: "Update Profile of Student, only accessed by Examination Head"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 changePassword:
*                                     type: boolean
*                                 oldPassword:
*                                     type: string
*                                 newPassword:
*                                     type: string
*                                 image:
*                                     type: string
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*/
module.exports = router;