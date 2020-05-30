const router = require('express').Router();
const entranceExamDB = require("../database/EntranceExamDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/examination.js');
const middleWare = require('../apiJoi/middleWare.js');

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
let checkTeacherBelongsToAccount = function (req, res, next) {
    entranceExamDB.checkExamHeadBelongsToAccount(req.params.teacherid, req.user.accountid).
        then(() => {
            return next();
        }).catch((ex) => {
            console.log(ex)
            res.status(400).json({ status: 0, statusDescription: "Not Authenticated user." });
        })
}
const classIdParams = middleWare(joiSchema.classIdParams, "params", true);
const studentIdParams = middleWare(joiSchema.studentIdParams, "params", true);
const studentIdClassIdSectionIdParams = middleWare(joiSchema.studentIdClassIdSectionIdParams, "params", true);
const questionIdParams = middleWare(joiSchema.questionIdParams, "params", true);
const entranceObject = middleWare(joiSchema.entranceObject, "body", true);
const studentIdBody = middleWare(joiSchema.studentIdBody, "body", true);
const questionObject = middleWare(joiSchema.questionObject, "body", true);
const resultObject = middleWare(joiSchema.resultObject, "body", true);


//get students for Exam head
router.get("/entrancestudents/:classId", isExaminationHead, classIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let students = await entranceExamDB.getStudentsForExamhead(req.user.userid, req.params.classId);
    if (students.length > 0) {
        let studentsObj = [];
        students.forEach(function (row) {
            studentsObj.push({
                studentid: row.userid,
                firstname: encrypt.decrypt(row.firstname),
                lastname: encrypt.decrypt(row.lastname),
                cellnumber: encrypt.decrypt(row.cellnumber),
                adharnumber: row.adharnumber,
                dob: encrypt.decrypt(row.dob),
                totalmarks: row.totalmarks,
                obtainedmarks: row.obtainedmarks,
                status: row.status,
                class: row.classid,
                userrole: row.userrole,
                section: row.section
            });
        });
        res.status(200).json({ status: 1, students: studentsObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Students are not Registered." });
    }
});

//delete student by Exam Head
router.delete("/deletestudent/:studentId", isExaminationHead, studentIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await entranceExamDB.deleteStudent(req.params.studentId, req.user.userid);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Student has been deleted successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Student has not been deleted.' })
    }
});

//pramote students by Exam Head
router.put("/pramotestudent/:studentId/:classId/:sectionId", isExaminationHead, studentIdClassIdSectionIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await entranceExamDB.pramoteStudent(req.user.userid, req.params.studentId, req.params.classId, JSON.parse(req.user.configdata).session, req.user.accountid, req.params.sectionId);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Student has been Promoted successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Student has not been Promoted.' });
    }
});

//get entrance question based on selected class by Exam Head
router.get("/getclassforquestion/:classId", isExaminationHead, classIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await entranceExamDB.getClassForEntrance(req.user.accountid, req.params.classId);
    if (result.length > 0) {
        var resultObj = []
        result.forEach(function (row) {
            resultObj.push({
                qid: row.qid,
                class: row.class,
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
router.post("/entranceRegistration", isExaminationHead, entranceObject, checkTeacherBelongsToAccount, async function (req, res) {
    let student = {
        fname: encrypt.encrypt(req.body.fname),
        lname: encrypt.encrypt(req.body.lname),
        cellnumber: encrypt.encrypt(req.body.cellnumber),
        username: encrypt.computeHash(req.body.adharnumber),
        password: encrypt.getHashedPassword(req.body.adharnumber),
        adharnumber: req.body.adharnumber,
        dob: encrypt.encrypt(req.body.dob),
        class: req.body.class,
        section: req.body.section,
        status: UserEnum.UserStatus.Active,
        userrole: UserEnum.UserRoles.EntranceStudent
    }
    let result
    if (req.body.studentId) {
        result = await entranceExamDB.updateEntranceStudent(studentObject, req.body.studentId, req.user.userid);
    } else {
        result = await entranceExamDB.saveStusentEntrance(student, req.user.userid);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.studentId ? 'Student record has been updated successfully.' : 'Student has been registered successfully.' })
    } else {
        res.status(400).json({ status: 0, statusDescription: 'Student registration not completed.' })
    }
});
//get student for update for edit
router.get("/getstudentforedit/:studentId", isExaminationHead, studentIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await entranceExamDB.getStudentForEdit(req.user.userid, req.params.studentId);
    if (result.length > 0) {
        var resultObj = []
        result.forEach(function (row) {
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
router.put("/reexamentrance", isExaminationHead, studentIdBody, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await entranceExamDB.updateEntranceUserrole(req.body.studentid, UserEnum.UserRoles.EntranceStudent, req.user.userid);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: 'Student status updated successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Student status not updated.' });
    }
});

//Create Entrance Questions
router.post("/entranceQuestion", isExaminationHead, questionObject, checkTeacherBelongsToAccount, async function (req, res) {
    let questionObject = {
        question: encrypt.encrypt(req.body.question),
        optiona: encrypt.encrypt(req.body.optiona),
        optionb: encrypt.encrypt(req.body.optionb),
        optionc: encrypt.encrypt(req.body.optionc),
        optiond: encrypt.encrypt(req.body.optiond),
        optione: encrypt.encrypt(req.body.optione),
        answer: req.body.answer,
        class: req.body.class,
        subject: req.body.subject,
        accountid: req.user.accountid
    }
    let result
    if (req.body.questionId) {
        questionObject.questionid = req.body.questionId;
        result = await entranceExamDB.updateEntranceQuestion(questionObject);
    } else {
        result = await entranceExamDB.saveEntranceQuestion(questionObject);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.questionId? 'Question has been updated successfully.': 'Quastion has been created successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Quastion not created.' });
    }
});

//get question for edit
router.get("/getquestionforedit/:questionId", isExaminationHead, questionIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await entranceExamDB.getQuestionForEdit(req.user.accountid, req.params.questionId);
    if (result.length > 0) {
        var resultObj = []
        result.forEach(function (row) {
            resultObj.push({
                qid: row.qid,
                class: row.class,
                question: encrypt.decrypt(row.question),
                optiona: encrypt.decrypt(row.optiona),
                optionb: encrypt.decrypt(row.optionb),
                optionc: encrypt.decrypt(row.optionc),
                optiond: encrypt.decrypt(row.optiond),
                optione: encrypt.decrypt(row.optione),
                answer: row.answer,
                class: row.class,
                subject: row.subject
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to fetch the data.' });
    }
})

//Delete question by Exam Head
router.delete("/deletequestion/:questionId", isExaminationHead, questionIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await entranceExamDB.deleteEntranceQuestion(req.params.questionId, req.user.accountid);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Question has been deleted successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to delete the question.' });
    }
});

//get entrance question for student
router.get("/getclassforquestion", isExaminationStudent, async function (req, res) {
    var result = await entranceExamDB.getQuestionForEntrance(req.user.userid, req.user.accountid);
    if (result.length > 0) {
        var resultObj = []
        result.forEach(function (row) {
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
router.post("/createentranceresult", isExaminationStudent, resultObject, async function (req, res) {
    var result = {
        studentid: req.user.userid,
        totalmarks: req.body.totalmarks,
        obtainedmarks: req.body.obtainedmarks
    }
    const r = Math.round((result.obtainedmarks * 100) / result.totalmarks);
    if (r > 60) {
        result.status = 'Passed'
    } else { result.status = 'Failed' }
    let results = await entranceExamDB.insertentranceresult(result, UserEnum.UserRoles.EntranceCompleted);
    if (results == 1) {
        res.status(200).json({ status: 1, statusDescription: "Exam completed." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save the reqult." });
    }
})
router.get("/getentranceresult", isExaminationCompleted, async function (req, res) {
    let result = await entranceExamDB.getEntranceCompletedResult(req.user.userid);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result[0] });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to fetch the data.' });
    }
})

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
*     /entranceexamservice/getclassforquestion/{classId}:
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
*     /entranceexamservice/deletequestion/{questionId}:
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
*     /entranceexamservice/createentranceresult:
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
*     /entranceexamservice/getentranceresult:
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