const router = require('express').Router();
const principalDB = require("../database/PrincipalDB.js");
const TeacherDB = require("../database/TeacherDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/Principal.js');
const middleWare = require('../apiJoi/middleWare.js');
const publisher = require('../pubsub/publisher');
const generator = require('generate-password');
const encrypt = require('../utils/encrypt');

const isPrincipal = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Principal) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
const isPrincipalAndDirector = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Director) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
let checkTeacherBelongsToAccount = async (req, res, next) => {
    let result = await principalDB.checkProviderByAccountID(req.params.teacherId || req.body.teacherId, req.user.accountId);
    if (result) {
        next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Principal and Teacher are not belongs to same account." });
    }
}

let checkTeacherBelongsToAccountPost = async (req, res, next) => {
    let result = await principalDB.checkProviderByAccountID(req.body.teacherid, req.user.accountid);
    if (result) {
        next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Principal and Teacher are not belongs to same account." });
    }
}

const staffObject = middleWare(joiSchema.staffObject, "body", true);
const teacherIdParams = middleWare(joiSchema.teacherIdParams, "params", true);
const subjectIdParams = middleWare(joiSchema.subjectIdParams, "params", true);
const assignClasstoFaculty = middleWare(joiSchema.assignClasstoFaculty, "body", true);
const assignSubjectToClass = middleWare(joiSchema.assignSubjectToClass, "body", true);
const attendanceArray = middleWare(joiSchema.attendanceArray, 'body', false);
const isStartDateAndEndDate = middleWare(joiSchema.isStartDateAndEndDate, "params", true);
const attendanceDateParams = middleWare(joiSchema.attendanceDateParams, "params", true);

//create or Update staff only accessed by principal
router.post("/createstaff", isPrincipal, staffObject, async (req, res) => {
    let password = generator.generate({ length: 10, numbers: true });
    let img = req.body.images;
    let image;
    if (img == null) {
        image = img
    } else if (img.length == 0) {
        image = null
    } else {
        image = img
    }
    let encryptimg;
    if (req.body.images !== '' && req.body.images != null) {
        encryptimg = image.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    let teacherObj = {
        firstName: encrypt.encrypt(req.body.firstName),
        lastName: encrypt.encrypt(req.body.lastName),
        emailId: encrypt.encrypt(req.body.emailId.toLowerCase()),
        userName: encrypt.computeHash(req.body.emailId.toLowerCase()),
        aadharNumber: encrypt.encrypt(req.body.aadharNumber),
        cellNumber: encrypt.encrypt(req.body.cellNumber),
        dob: encrypt.encrypt(req.body.dob),
        gender: req.body.gender,
        qualification: req.body.qualification,
        subject: req.body.subject,
        parmanentAddress: req.body.parmanentAddress,
        localAddress: req.body.localAddress,
        userrole: req.body.userrole,
        images: encryptimg,
        sessionId: JSON.parse(req.user.configData).sessionId,
        salary: req.body.salary,
        workExperience: req.body.workExperience,
        educationalAwards: req.body.educationalAwards
    };
    if (req.body.educationalAwards == 1) {
        teacherObj.awardDetails = req.body.awardDetails;
    }
    let userRole = '';
    if (req.body.userrole === 5) {
        userRole = 'Faculty'
    } else if (req.body.userrole === 6) {
        userRole = 'Examination Head'
    } else if (req.body.userrole === 7) {
        userRole = 'Accountant'
    }
    let result = '';
    let userCreatedUpdate = "Created";
    if (req.body.teacherId) {
        userCreatedUpdate = "updated"
        let publishEvent = {
            "emailId": req.body.emailId.toLowerCase(),
            "staffName": req.body.firstName + " " + req.body.lastName,
            "schoolName": req.user.accountName,
            "principalName": req.user.firstName + " " + req.user.lastName,
            "tempPassword": password,
            "userRole": userRole
        }
        publisher.publishEmailEventForCreateStaff(publishEvent);

        result = await principalDB.updateTeacherDetails(req.body.teacherId, teacherObj, req.body.entranceExamType);
    } else {
        let publishEvent = {
            "emailId": req.body.emailId.toLowerCase(),
            "staffName": req.body.firstName + " " + req.body.lastName,
            "schoolName": req.user.accountName,
            "principalName": req.user.firstName + " " + req.user.lastName,
            "tempPassword": password,
            "userRole": userRole
        }
        teacherObj.status = UserEnum.UserStatus.Pending;
        teacherObj.password = encrypt.getHashedPassword(req.body.aadharNumber);
        teacherObj.wrongPasswordCount = 0;
        teacherObj.classId = 0;
        teacherObj.sectionId = 0;
        result = await principalDB.createTeacher(teacherObj, req.user.userId, req.user.accountId, req.user.userType, req.body.entranceExamType);
        if (result == 1) {
            publisher.publishEmailEventForCreateStaff(publishEvent);
        }
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `${userRole} has been ${userCreatedUpdate} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: `${userRole} is not ${userCreatedUpdate}.` });
    }
});

//get teacher details for update by principal
router.get("/getteacherdetailforupdate/:teacherId", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async (req, res) => {
    let result = await principalDB.getTeacherDetailForUpdate(req.user.accountId, req.user.userId, req.params.teacherId, req.user.userType);
    if (result.length > 0) {
        let row = result[0];
        let teacherObj = {
            userId: row.userId,
            firstName: encrypt.decrypt(row.firstName),
            lastName: encrypt.decrypt(row.lastName),
            dob: encrypt.decrypt(row.dob),
            gender: row.gender,
            cellNumber: encrypt.decrypt(row.cellNumber),
            emailId: encrypt.decrypt(row.emailId),
            aadharNumber: encrypt.decrypt(row.aadharNumber),
            gender: row.gender,
            subject: row.subject,
            qualification: row.qualification,
            userrole: row.userrole,
            localAddress: row.localAddress,
            parmanentAddress: row.parmanentAddress,
            images: row.images,
            salary: row.salary,
            entranceExamType: row.entranceExamType,
            workExperience: row.workExperience,
            educationalAwards: row.educationalAwards,
            awardDetails: row.awardDetails
        };
        res.status(200).json({ status: 1, statusDescription: teacherObj })
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get teacher details.' })
    }
});

//Delete Users
router.get("/deleteusers/:teacherId", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async (req, res) => {
    let userroleArray = [UserEnum.UserRoles.Teacher, UserEnum.UserRoles.ExamHead, UserEnum.UserRoles.FeeAccount]
    let results = await principalDB.deleteUsers(req.params.teacherId, req.user.accountId, userroleArray);
    if (results.affectedRows) {
        res.status(200).json({ status: 1, statusDescription: "User has been deleted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "You can not delete class teacher. You want to delete then first unassigned class." });
    }
})

//assign class by principal
router.post("/assignclasstofaculty", isPrincipal, assignClasstoFaculty, checkTeacherBelongsToAccount, async (req, res) => {
    let classObject = {
        classId: req.body.selectedClass,
        sectionId: req.body.selectedSection
    }
    let result = await principalDB.assignClassToTeacher(req.body.teacherId, classObject, req.user.accountId);
    if (result == 1) {
        let teacherDetails = await principalDB.getTeacherDetails(req.body.teacherId);
        if (teacherDetails.length > 0) {
            let publishEvent = {
                "emailId": encrypt.decrypt(teacherDetails[0].emailId),
                "staffName": encrypt.decrypt(teacherDetails[0].firstName),
                "schoolName": req.user.accountName,
                "classId": teacherDetails[0].classId,
                "sectionId": teacherDetails[0].sectionId,
                "userRole": teacherDetails[0].userrole
            }
            publisher.publishEmailEventForAssignClass(publishEvent);
        }
        res.status(200).json({ status: 1, statusDescription: 'Class has been assigned successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'This class and section is already assigned some other teacher.' });
    }
});

//Unassigned class
router.get("/unassignedclass/:teacherId", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async (req, res) => {
    let results = await principalDB.unAssignedClass(req.params.teacherId);
    if (results.affectedRows) {
        let teacherDetails = await principalDB.getTeacherDetails(req.body.teacherId);
        if (teacherDetails.length > 0) {
            let publishEvent = {
                "emailId": encrypt.decrypt(teacherDetails[0].emailId),
                "staffName": encrypt.decrypt(teacherDetails[0].firstName),
                "schoolName": req.user.accountName,
                "classId": teacherDetails[0].classId,
                "sectionId": teacherDetails[0].sectionId,
                "userRole": teacherDetails[0].userrole
            }
            publisher.publishEmailEventForUnAssignClass(publishEvent);
        }
        res.status(200).json({ status: 1, statusDescription: "Class has been unassigned successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to unassigned class." });
    }
})

//get account
router.get("/getAccountByPrincipal", isPrincipal, async (req, res) => {
    let results = await principalDB.getAllAccounts(req.user.userId);
    if (results.length > 0) {
        results.forEach((result) => {
            result.accountname = result.accountname;
            result.accountid = result.accountid
        });
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the acoount.' });
    }
});

//get teachers of selected school
router.get("/getStaffList", isPrincipal, async (req, res) => {
    var results = await principalDB.getAllStaffByAccountId(req.user.accountId, req.user.userId, req.user.userType);
    if (results.length > 0) {
        var teacherObj = [];
        results.forEach((result) => {
            teacherObj.push({
                userId: result.userId,
                firstName: encrypt.decrypt(result.firstName),
                lastName: encrypt.decrypt(result.lastName),
                aadharNumber: encrypt.decrypt(result.aadharNumber),
                emailId: encrypt.decrypt(result.emailId),
                cellNumber: encrypt.decrypt(result.cellNumber),
                gender: result.gender,
                classId: result.classId,
                sectionId: result.sectionId,
                qualification: result.qualification,
                userrole: result.userrole,
                subject: result.subject,
                images: result.images,
                status: result.status
            })
        });
        res.status(200).json({ status: 1, statusDescription: teacherObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the teachers details.' });
    }
});

//get students by principal
router.get("/students/:teacherId", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async (req, res) => {
    let getStudentObj = {
        teacherId: req.params.teacherId,
        accountId: req.user.accountId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        userType: req.user.userType,
        status: [UserEnum.StudentStatus.Pramoted, UserEnum.StudentStatus.Active, UserEnum.UserStatus.Locked, UserEnum.UserStatus.Inactive, UserEnum.UserStatus.UnLocked],
    }
    let result = await TeacherDB.getAllStudents(getStudentObj);
    if (result.length > 0) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                userId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                motherName: encrypt.decrypt(row.motherName),
                fatherName: encrypt.decrypt(row.fatherName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                userrole: row.userrole,
                roll: row.rollnumber,
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                mediumType: row.mediumType,
                status: row.status,
                images: row.images,
                classId: row.classId,
                sectionId: row.sectionId,
                busService: row.busService
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'There are no student found for this teacher.' });
    }
});
//check assigned class and section
router.get("/getAssignedClassAndSection/:teacherId", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async (req, res) => {
    let result = await principalDB.getAssignedClassAndSection(req.params.teacherId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Class not assigned" });
    }
})
//get config Details
router.get("/configDetails", isPrincipalAndDirector, async (req, res) => {
    let results = await principalDB.getConfigByAccountId(req.user.accountid, req.user.userId);
    if (results) {
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get config details' });
    }
});

//get assigned class
router.get("/getAssignedClass/:teacherId", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async (req, res) => {
    let assignClass = await principalDB.getAssignedClass(req.params.teacherId);
    if (assignClass.length > 0) {
        res.status(200).json({ status: 1, statusDescription: assignClass });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the assign subjects.' });
    }

});

//get subjects by selected class
router.get("/getsubjectsofselectedclass/:classId", isPrincipal, subjectIdParams, async (req, res) => {
    let result = await principalDB.getSubjectForClass(req.user.accountId, req.user.userId, req.params.classId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: JSON.parse(result[0].subjects) });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Subjects are not assigned to this class. First assign the subject.' })
    }
})
//assign subjects to selected class
router.post("/assignsubjectstoselectedclass", isPrincipal, assignSubjectToClass, async (req, res) => {
    let subjectObject = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        classId: req.body.selectedClass,
        subjects: JSON.stringify(req.body.subjectOptions)
    }
    let result = await principalDB.assignSubjectToClass(subjectObject);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: 'Subjects assigned to selected class successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'First add the subjects.' });
    }
});
//get teacher Details
router.get("/getPrincipalDetails", isPrincipal, async (req, res) => {
    let result = await principalDB.getPrincipalDetails(req.user.userId);
    if (result.length > 0) {
        let resultObj = {
            firstName: encrypt.decrypt(result[0].firstName),
            lastName: encrypt.decrypt(result[0].lastName),
            cellNumber: encrypt.decrypt(result[0].cellNumber),
            aadharNumber: encrypt.decrypt(result[0].aadharNumber),
            emailId: encrypt.decrypt(result[0].emailId),
            parmanentAddress: result[0].parmanentAddress,
            localAddress: result[0].localAddress,
            image: result[0].images
        };
        res.status(200).json({ status: 1, statusDescription: resultObj })
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the Teacher details." });
    }
})

// *************************
//save staff Attendance
router.post('/saveStaffAttendance', isPrincipal, attendanceArray, async (req, res) => {
    let attendanceArray = []
    req.body.attendanceArray.map((item) => {
        let array = []
        array.push(item.studentId)
        array.push(req.user.userId)
        array.push(JSON.parse(req.user.configData).sessionId)
        array.push(item.attendanceDate)
        array.push(item.attendance)
        array.push(item.reason)
        attendanceArray.push(array)
    })
    let result = await principalDB.saveStaffAttendance(attendanceArray);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: "Attendance has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Attendance is not saved." });
    }
});

//get staff attendance by date
router.get('/getStaffAttendanceOfDate/:attendanceDate', isPrincipal, attendanceDateParams, async (req, res) => {
    let attendanceObj = {
        userId: req.user.userId,
        attendanceDate: req.params.attendanceDate,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let result = await principalDB.getStaffAttendanceOfDate(attendanceObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the result." });
    }
});

//get staff attendance of time period 
router.get('/getStaffAttendanceOfSelectedDates/:startDate/:endDate', isPrincipal, isStartDateAndEndDate, async (req, res) => {
    let attendanceObj = {
        userId: req.user.userId,
        startDate: req.params.startDate,
        endDate: req.params.endDate,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let result = await principalDB.getStaffAttendanceOfSelectedDates(attendanceObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the attendance." });
    }
});

//get class attendance of time period  
router.get('/getClassAttendanceOfSelecteddates/:teacherId/:startDate/:endDate', isPrincipal, async (req, res) => {
    let attendanceObj = {
        accountId: req.user.accountId,
        teacherId: req.params.teacherId,
        userType: req.user.userType,
        startDate: req.params.startDate,
        endDate: req.params.endDate,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let result = await TeacherDB.getClassAttendanceOfSelecteddates(attendanceObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the attendance." });
    }
});


/**
* @swagger
* paths:
*     /principalservice/createstaff:
*         post:
*             description: Create Staff 
*             tags: [Principal Service]
*             summary: "Create users for school, only accessed by principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 firstname:
*                                     type: string
*                                 lastname:
*                                     type: string
*                                 cellnumber:
*                                     type: string
*                                 emailid:
*                                     type: string
*                                 dob:
*                                     type: string
*                                 gender:
*                                     type: number
*                                 qualification:
*                                     type: number
*                                 subject:
*                                     type: number
*                                 adharnumber:
*                                     type: string
*                                 parmanentaddress:
*                                     type: string
*                                 localaddress:
*                                     type: string
*                                 userrole:
*                                     type: number
*                                 salary: 
*                                     type: number
*                                 images:
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
*     /principalservice/getteacherdetailforupdate/{teacherid}:
*      get:
*          description: Get Teacher Details, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Teacher Details for Edit, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   userId: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   dob: ''
*                                   emailid: ''
*                                   gender: ''
*                                   cellnumber: ''
*                                   adharnumber: ''
*                                   subject: ''
*                                   qualification: ''
*                                   userrole: ''
*                                   parmanentaddress: ''
*                                   localaddress: ''
*                                   salary: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/deleteusers/{teacherid}:
*       get:
*          description: Delete User, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Delete User from the school, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /principalservice/assignclasstofaculty:
*         post:
*             description: Assign class
*             tags: [Principal Service]
*             summary: "Assign class to Teacher, only accessed by principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 selectedClass:
*                                     type: number
*                                 selectedSection:
*                                     type: number
*                                 teacherid:
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
*     /principalservice/unassignedclass/{teacherid}:
*       get:
*          description: Unassign the class, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Unassign the class, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /principalservice/getAccountByPrincipal:
*       get:
*          description: Get Account , only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Account By Principal, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   accountname: ''
*                                   accountid: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/teachers:
*       get:
*          description: Get all teachers, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get all teachers of school, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   userId: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   adharnumber: ''
*                                   emailid: ''
*                                   cellnumber: ''
*                                   gender: ''
*                                   classid: ''
*                                   qualification: ''
*                                   subject: ''
*                                   userrole: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/students/{teacherid}:
*       get:
*          description: Get students list, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get students list of selected teacher, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   userId: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   mothername: ''
*                                   fathername: ''
*                                   cellnumber: ''
*                                   gender: ''
*                                   adharnumber: ''
*                                   dob: ''
*                                   religion: ''
*                                   category: ''
*                                   locality: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/configDetails:
*       get:
*          description: Get Config Details, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Config Details od School, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /principalservice/getAssignedClass/{teacherid}:
*       get:
*          description: Get assigned class, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get assigned class of a teacher, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /principalservice/getsubjectsofselectedclass/{classId}:
*       get:
*          description: Get Subjects of Selected Class, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Subjects of Selected Class, only access by Prinipal 
*          parameters:
*              - in: path
*                name: classId
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /principalservice/assignsubjectstoselectedclass:
*         post:
*             description: Assign Subjects to Selected Class
*             tags: [Principal Service]
*             summary: "Assign Subjects to Selected Class, only accessed by principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 selectedClass:
*                                     type: number
*                                 subjectOptions:
*                                     type: array
*                                     items:
*                                       type: integer
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /principalservice/getPrincipalDetails:
*       get:
*          description: Get Principal Details, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Principal Details, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   firstname: ''
*                                   lastname: ''
*                                   emailid: ''
*                                   cellnumber: ''
*                                   localaddress: ''
*                                   parmanentaddress: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*/

module.exports = router;
