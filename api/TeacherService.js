const router = require('express').Router();
const teacherDB = require("../database/TeacherDB.js");
const UserEnum = require('../lookup/UserEnum');
const passwordHash = require('password-hash');
const joiSchema = require('../apiJoi/teacher.js');
const middleWare = require('../apiJoi/middleWare.js');
const encrypt = require('../utils/encrypt');

 // "host": "edusamadhan.cnztxxphfuut.ap-south-1.rds.amazonaws.com",
            // "user": "admin",
            // "password": "Alopa1994",
            // "database": "edusamadhan"
function isTeacherOrExamHead(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.ExamHead) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isTeacher(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Teacher) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isTeacherOrprincipalOrStudent(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Student) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isTeacherOrStudentOrPrincipal(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.Student || req.user.role === UserEnum.UserRoles.Principal) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function AllUsers(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.ExamHead || req.user.role === UserEnum.UserRoles.FeeAccount || req.user.role === UserEnum.UserRoles.SuperAdmin || req.user.role === UserEnum.UserRoles.Manager || req.user.role === UserEnum.UserRoles.Director || req.user.role === UserEnum.UserRoles.Student) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
async function isTeacherStudentRelated(req, res, next) {
    let result = await teacherDB.checkTeacherStudentRelation(req.params.studentId, req.user.accountId);
    if (result) {
        next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Student and Teacher are not belongs to same account." });
    }
}
async function isTeacherStudentRelatedBody(req, res, next) {
    let result = await teacherDB.checkTeacherStudentRelation(req.body.studentId, req.user.accountid);
    if (result) {
        next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Student and Teacher are not belongs to same account." });
    }
}
const studentObject = middleWare(joiSchema.studentObject, "body", true);
const studentIdParams = middleWare(joiSchema.studentIdParams, "params", true);
const homeWorkIdParams = middleWare(joiSchema.homeWorkIdParams, "params", true);
const emailIdParams = middleWare(joiSchema.emailIdParams, "params", true);
const studentCreateResult = middleWare(joiSchema.studentCreateResult, "body", true);
const studentCreateAttendance = middleWare(joiSchema.studentCreateAttendance, "body", false);
const studentIdBody = middleWare(joiSchema.studentIdBody, "body", true);
const saveAttendanceObject = middleWare(joiSchema.saveAttendanceObject, "body", true);
const saveResultObject = middleWare(joiSchema.saveResultObject, "body", true);
const getResultObject = middleWare(joiSchema.getResultObject, "params", true);
const attendanceArray = middleWare(joiSchema.attendanceArray, 'body', false);
const homeWorkObject = middleWare(joiSchema.homeWorkObject, "body", false);
const noticeObject = middleWare(joiSchema.noticeObject, "body", false);
const parentDetailsObj = middleWare(joiSchema.parentDetailsObj, "body", false);
const studentIdAndId = middleWare(joiSchema.studentIdAndId, "params", true);
const imageObj = middleWare(joiSchema.imageObj, "body", false);

//get Students for teacher
router.get("/getTeacherClassAndSection", isTeacherOrExamHead, async (req, res) => {
    let result = await teacherDB.getTeacherClassSection(req.user.userId, JSON.parse(req.user.configData).sessionId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result[0] });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the students.' });
    }
});
//Student Registration
router.post("/studentRegistration", isTeacherOrExamHead, studentObject, async (req, res) => {
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
    let studentObj = {
        firstName: encrypt.encrypt(req.body.firstName),
        lastName: encrypt.encrypt(req.body.lastName),
        motherName: encrypt.encrypt(req.body.motherName),
        fatherName: encrypt.encrypt(req.body.fatherName),
        cellNumber: encrypt.encrypt(req.body.cellNumber),
        userName: encrypt.computeHash(req.body.aadharNumber),
        dob: encrypt.encrypt(req.body.dob),
        aadharNumber: encrypt.encrypt(req.body.aadharNumber),
        gender: req.body.gender,
        religion: req.body.religion,
        category: req.body.category,
        locality: req.body.locality,
        mediumType: req.body.mediumType,
        localAddress: req.body.localAddress,
        parmanentAddress: req.body.parmanentAddress,
        userrole: UserEnum.UserRoles.Student,
        images: encryptimg,
        sessionId: JSON.parse(req.user.configData).sessionId,
        busService: req.body.busService,
        route: req.body.route,
        classId: req.body.classId,
        sectionId: req.body.sectionId
    }
    if (req.body.status == 13) {
        studentObj.status = UserEnum.UserStatus.Active;
    }
    let result = 0;
    if(req.body.studentId){
        studentObj.userId = req.body.studentId,
        result = await teacherDB.updateStusentRecord(studentObj, req.user.userId, req.user.accountId, req.body.status, req.user.userType);
    }else{
        studentObj.status = UserEnum.StudentStatus.Pramoted;
        studentObj.password = encrypt.getHashedPassword(req.body.aadharNumber);
        studentObj.wrongPasswordCount = 0;
        result = await teacherDB.createStudentDetails(studentObj, req.user.userId, req.user.accountId, req.user.userType);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: 'Student has been updated successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Your principal is not assigned you any class.' });
    }
});
// getting student information for update 
router.get("/getStudentDetailsForUpdate/:studentId", isTeacherOrExamHead, studentIdParams, isTeacherStudentRelated, async (req, res) => {
    let result = await teacherDB.getStudentDetails(req.params.studentId, JSON.parse(req.user.configData).sessionId);
    if (result.length > 0) {
        let studentObj = [];
        result.forEach(function (row) {
            studentObj.push({
                userId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                motherName: encrypt.decrypt(row.motherName),
                fatherName: encrypt.decrypt(row.fatherName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                localAddress: row.localAddress,
                parmanentAddress: row.parmanentAddress,
                images: row.images,
                busService: row.busService,
                route: row.route,
                classId: row.classId,
                sectionId: row.sectionId,
                status: row.status,
                mediumType: row.mediumType
            });
        });
        res.status(200).json({ status: 1, statusDescription: studentObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
    }
});
//get Students for teacher
router.get("/getmystudents", isTeacherOrExamHead, async (req, res) => {
    let getStudentObj = {
        teacherId: req.user.userId,
        accountId: req.user.accountId,
        userType: req.user.userType,
        sessionId: JSON.parse(req.user.configData).sessionId,
        status: [UserEnum.StudentStatus.Pramoted, UserEnum.StudentStatus.Active, UserEnum.UserStatus.Locked, UserEnum.UserStatus.Inactive, UserEnum.UserStatus.UnLocked],
    }
    let result = await teacherDB.getAllStudents(getStudentObj);
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
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the students.' });
    }
});

//check assigned class and section
router.get("/getAssignedClassAndSection", async (req, res) => {
    let result = await teacherDB.getAssignedClassAndSection(req.user.userId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Class not assigned" });
    }
})
//check adharnumber
router.get("/getAadharNumber/:aadharNumber", async (req, res) => {
    let result = await teacherDB.checkAadharNumber(encrypt.encrypt(req.params.aadharNumber));
    if (result) {
        res.status(200).json({ "isAdharNumberUsed": true });
    } else {
        res.status(200).json({ "isAdharNumberUsed": false });
    }
})

//check emailid 
router.get("/getEmailId/:emailId", async (req, res) => {
    let result = await teacherDB.checkEmailId(encrypt.encrypt(req.params.emailId));
    if (result) {
        res.status(200).json({ "isEmailIdUsed": true });
    } else {
        res.status(200).json({ "isEmailIdUsed": false });
    }
})

//get config details(Delete)
router.get("/:teacherId/getconfigdetails", async (req, res) => {
    let result = await teacherDB.getconfigdetailsByAllUsers(req.params.teacherId);
    if (result.length > 0) {
        let configData = JSON.parse(result[0].configData);
        res.status(200).json({ status: 1, statusDescription: configData });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'There is no config.' });
    }
})
//get assign subjects
router.get("/assignsubjects", isTeacherOrExamHead, async (req, res) => {
    let result = await teacherDB.getAssignSubjectToClass(req.user.userId, req.user.accountId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: JSON.parse(result[0].subjects) });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Principal is not assigned subjects for this class.' });
    }
})
//Save Student Result
router.post("/studentResult", isTeacherOrExamHead, isTeacherStudentRelatedBody, studentCreateResult, async (req, res) => {
    let result;
    switch (req.body.subjectId) {
        case 1: result = { hindi: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) }
            break;
        case 2: result = { english: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 3: result = { mathematics: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 4: result = { science: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 5: result = { socialscience: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 6: result = { geography: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 7: result = { physics: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 8: result = { chemistry: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 9: result = { biology: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 10: result = { moralscience: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 11: result = { drawing: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        case 12: result = { computer: JSON.stringify([{ totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }]) };
            break;
        default:
            break;
    }
    result.teacherId = req.user.userId,
        result.studentId = req.body.studentId
    result.examinationtype = req.body.examinationtype
    let results = await teacherDB.saveStusentResult(resultId, JSON.parse(req.user.configData).sessionId);
    if (results) {
        res.status(200).json({ status: 1, statusDescription: "Student result has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save student result" });
    }
});
//Save Student Attendance by class teacher
router.post("/studentAttendance", isTeacherOrExamHead, isTeacherStudentRelatedBody, studentCreateAttendance, async (req, res) => {
    let result;
    switch (req.body.monthName) {
        case 1: result = { january: req.body.monthName, jtd: req.body.totalClasses, jpd: req.body.presentClasses };
            break;
        case 2: result = { february: req.body.monthName, ftd: req.body.totalClasses, fpd: req.body.presentClasses };
            break;
        case 3: result = { march: req.body.monthName, mtd: req.body.totalClasses, mpd: req.body.presentClasses };
            break;
        case 4: result = { april: req.body.monthName, atd: req.body.totalClasses, apd: req.body.presentClasses };
            break;
        case 5: result = { may: req.body.monthName, matd: req.body.totalClasses, mapd: req.body.presentClasses };
            break;
        case 6: result = { june: req.body.monthName, juntd: req.body.totalClasses, junpd: req.body.presentClasses };
            break;
        case 7: result = { july: req.body.monthName, jultd: req.body.totalClasses, julpd: req.body.presentClasses };
            break;
        case 8: result = { august: req.body.monthName, autd: req.body.totalClasses, aupd: req.body.presentClasses };
            break;
        case 9: result = { september: req.body.monthName, std: req.body.totalClasses, spd: req.body.presentClasses };
            break;
        case 10: result = { october: req.body.monthName, otd: req.body.totalClasses, opd: req.body.presentClasses };
            break;
        case 11: result = { november: req.body.monthName, ntd: req.body.totalClasses, npd: req.body.presentClasses };
            break;
        case 12: result = { december: req.body.monthName, dtd: req.body.totalClasses, dpd: req.body.presentClasses };
            break;
        default:
            break;
    }
    result.teacherId = req.user.userId,
        result.studentId = req.body.studentId
    let attendance = await teacherDB.saveStusentAttendance(resultId, JSON.parse(req.user.configData).sessionId);
    if (attendance) {
        res.status(200).json({ status: 1, statusDescription: "Student attendance has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save student attendance" });
    }
});

//get Student Result All
router.get("/getstudentsresult", isTeacherOrExamHead, async (req, res) => {
    let result = await teacherDB.getStudentsResult(req.user.userId);
    if (result.length > 0) {
        let resultObj = []
        result.forEach((row) => {
            resultObj.push({
                studentId: row.studentId,
                hindi: row.hindi,
                hindiobtainmarks: row.hindiobtainmarks,
                english: row.english,
                englishobtainmarks: row.englishobtainmarks,
                math: row.math,
                mathobtainmarks: row.mathobtainmarks,
                science: row.science,
                scienceobtainmarks: row.scienceobtainmarks,
                history: row.history,
                historyobtainmarks: row.historyobtainmarks,
                physics: row.physics,
                physcisobtainmarks: row.physcisobtainmarks,
                chemistry: row.chemistry,
                chemistryobtainmarks: row.chemistryobtainmarks
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the result details." });
    }
})
//get Attendance of all students
router.get("/getstudentsattendance", isTeacherOrExamHead, async (req, res) => {
    let results = await teacherDB.getAllStudentsAttendance(req.user.userId);
    if (results.length > 0) {
        let resultObj = [];
        results.forEach((result) => {
            resultObj.push({
                studentId: result.studentId,
                january: result.january,
                jtd: result.jtd,
                jpd: result.jpd,
                february: result.february,
                ftd: result.ftd,
                fpd: result.fpd,
                march: result.march,
                mtd: result.mtd,
                mpd: result.mpd,
                april: result.april,
                atd: result.atd,
                apd: result.apd,
                may: result.may,
                matd: result.matd,
                mapd: result.mapd,
                june: result.june,
                juntd: result.juntd,
                junpd: result.junpd,
                july: result.july,
                jultd: result.jultd,
                julpd: result.julpd,
                august: result.august,
                autd: result.autd,
                aupd: result.aupd,
                september: result.september,
                std: result.std,
                spd: result.spd,
                october: result.october,
                otd: result.otd,
                opd: result.opd,
                november: result.november,
                ntd: result.ntd,
                npd: result.npd,
                december: result.december,
                dtd: result.dtd,
                dpd: result.dpd
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the attendance' });
    }
})
//get teacher Details
router.get("/getTeacherDetails", AllUsers, async (req, res) => {
    let result = await teacherDB.getTeacherDetails(req.user.userId);
    if (result.length > 0) {
        let resultObj = {
            firstName: encrypt.decrypt(result[0].firstName),
            lastName: encrypt.decrypt(result[0].lastName),
            cellNumber: encrypt.decrypt(result[0].cellNumber),
            aadharNumber: encrypt.decrypt(result[0].aadharNumber),
            emailId: encrypt.decrypt(result[0].emailId),
            dob: result[0].dob,
            parmanentAddress: result[0].parmanentAddress,
            localAddress: result[0].localAddress,
            qualification: result[0].qualification,
            classId: result[0].classId,
            sectionId: result[0].sectionId,
            image: result[0].images
        };
        res.status(200).json({ status: 1, statusDescription: resultObj })
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the Teacher details." });
    }
})
//Update teacher profile
router.post("/updateProfileDetails", AllUsers, imageObj, async (req, res) => {
    let img = req.body.image;
    if (img == null) {
        image = img
    } else if (img.length == 0) {
        image = null
    } else {
        image = img
    }
    if (req.body.image !== '' && req.body.image != null) {
        let encryptimg = img.replace(/^data:image\/[a-z]+;base64,/, "");
        let result = await teacherDB.updateOnboardDetails(encryptimg, req.user.userId)
        if (result.affectedRows == 1) {
            return res.status(200).json({ status: 1, statusDescription: "Profile image has been updated successfully." });
        } else {
            return res.status(200).json({ status: 0, statusDescription: "Not able to save the record." });
        }
    }else {
        return res.status(200).json({ status: 0, statusDescription: "Not able to save the record." });
    }
})
//Inactivate student by class teacher
router.post('/inactivatestudent', isTeacherOrExamHead, studentIdBody, isTeacherStudentRelatedBody, async (req, res) => {
    let result = await teacherDB.inactivateStudent(req.body.studentId, UserEnum.UserStatus.Inactive, UserEnum.UserRoles.Student);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Student has been inactivated successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Student is not inactivated." });
    }
});
//Inactivate student by class teacher
router.post('/reactivatestudent', isTeacherOrExamHead, studentIdBody, isTeacherStudentRelatedBody, async (req, res) => {
    let result = await teacherDB.reactivateStudent(req.body.studentId, UserEnum.StudentStatusEnum.active, UserEnum.UserRoles.Student);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Student has been activated successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Student is not Reactivated." });
    }
});
//get Inactivated Students for teacher
router.get("/getmyinactivatedstudents", isTeacherOrExamHead, async (req, res) => {
    let result = await teacherDB.getAllInactivatedStudents(req.user.userId, UserEnum.UserStatus.Locked, JSON.parse(req.user.configData).sessionId);
    if (result.length > 0) {
        let resultObj = [];
        result.forEach((row) => {
            resultObj.push({
                userId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                motherName: encrypt.decrypt(row.motherName),
                fatherName: encrypt.decrypt(row.fatherName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                roll: row.rollnumber,
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                status: row.status,
                mediumType: row.mediumType,
                busService: row.busService,
                images: row.images
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'No Inactivate Student fount of this class.' });
    }
});
//get student Registration print details
router.get("/getstudentregistrationdetails/:studentId", isTeacherOrExamHead, studentIdBody, async (req, res) => {
    let result = await teacherDB.getStudentRegistrationDetails(req.params.studentId, JSON.parse(req.user.configData).sessionId, req.user.accountId);
    if (result.studentData.length > 0) {
        let freePrintData = {
            schoolName: result.school[0].accountName,
            schoolNumber: result.school[0].accountRefNumber,
            schoolAddress: result.school[0].accountAddress,
            studentName: encrypt.decrypt(result.studentData[0].firstName) + " " + encrypt.decrypt(result.studentData[0].lastName),
            aadharNumber: encrypt.decrypt(result.studentData[0].aadharNumber),
            cellNumber: encrypt.decrypt(result.studentData[0].cellnNmber),
            dob: encrypt.decrypt(result.studentData[0].dob),
            motherName: encrypt.decrypt(result.studentData[0].motherName),
            fatherName: encrypt.decrypt(result.studentData[0].fatherName),
            classId: result.studentData[0].classId,
            sectionId: result.studentData[0].sectionId,
            gender: result.studentData[0].gender,
            religion: result.studentData[0].religion,
            category: result.studentData[0].category,
            locality: result.studentData[0].locality,
            localAddress: result.studentData[0].localAddress,
            parmanentAddress: result.studentData[0].parmanentAddress
        }
        res.status(200).json({ status: 1, statusDescription: freePrintData });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the data." });
    }
})

//save attendance student by class teacher
router.post('/savedailyattendance', isTeacherOrExamHead, saveAttendanceObject, async (req, res) => {
    let attendanceObj = [];
    for (let i = 0; i < req.body.length; i++) {
        attendanceObj.push({
            accountId: req.user.accountId,
            teacherId: req.user.userId,
            studentId: req.body[i].studentId,
            classId: req.body[i].classId,
            sectionId: req.body[i].sectionId,
            sessionId: JSON.parse(req.user.configData).sessionId,
        })
    }
    let result = await teacherDB.saveDailyAttendance(attendanceObj);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Attendance has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Attendance is not saved." });
    }
});

//get student attendance
router.get('/getdailyattendance', async (req, res) => {
    let result = await teacherDB.getDailyAttendance(req.user.accountId, req.user.userId, JSON.parse(req.user.configData).sessionId);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Student is not Reactivated." });
    }
});

//save exam result of student
router.post('/savestudentresult', isTeacherOrExamHead, saveResultObject, async (req, res) => {
    let resultObject = {
        studentId: req.body.studentId,
        teacherId: req.user.userId,
        examinationType: req.body.examinationType,
        sessionId: JSON.parse(req.user.configData).sessionId,
        subjectResultArray: JSON.stringify(req.body.subjectResultArray)
    }

    let result = await teacherDB.saveStudentResult(resultObject);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Result has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Result is not saved." });
    }
});

//get exam result of student
router.get('/getstudentresult/:studentId/:examinationType', isTeacherOrExamHead, getResultObject, async (req, res) => {
    let resultObject = {
        studentId: req.params.studentId,
        teacherId: req.user.userId,
        examinationType: req.params.examinationType,
        sessionId: JSON.parse(req.user.configData).sessionId
    }

    let result = await teacherDB.getStudentResult(resultObject);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the result." });
    }
});

//save exam result of student
router.post('/savestudentAttendance', isTeacher, attendanceArray, async (req, res) => {
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
    let result = await teacherDB.saveStudentAttendance(attendanceArray);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: "Attendance has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Attendance is not saved." });
    }
});

//get class attendance by date
router.get('/getClassAttendanceOfDate/:attendanceDate', isTeacher, async (req, res) => {
    let attendanceObj = {
        accountId: req.user.accountId,
        teacherId: req.user.userId,
        userType: req.user.userType,
        attendanceDate: req.params.attendanceDate,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let result = await teacherDB.getClassAttendanceOfDate(attendanceObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the result." });
    }
});

//get class attendance of time period   
router.get('/getClassAttendanceOfSelecteddates/:startDate/:endDate', isTeacher, async (req, res) => {
    let attendanceObj = {
        accountId: req.user.accountId,
        teacherId: req.user.userId,
        userType: req.user.userType,
        startDate: req.params.startDate,
        endDate: req.params.endDate,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let result = await teacherDB.getClassAttendanceOfSelecteddates(attendanceObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the attendance." });
    }
});

//get student profile details
router.get('/getstudentprofile/:studentId', isTeacherOrStudentOrPrincipal, studentIdParams, async (req, res) => {
    let result = await teacherDB.getStudentprofileDetails(req.params.studentId, JSON.parse(req.user.configData).sessionId);
    if (result.length > 0) {
        let studentObj = {
            studentId: result[0].userId,
            studentName: encrypt.decrypt(result[0].firstName + " " + encrypt.decrypt(result[0].lastName)),
            aadharNumber: encrypt.decrypt(result[0].aadharNumber),
            cellNumber: encrypt.decrypt(result[0].cellNumber),
            motherName: encrypt.decrypt(result[0].motherName),
            fatherName: encrypt.decrypt(result[0].fatherName),
            dob: encrypt.decrypt(result[0].dob),
            gender: result[0].gender,
            category: result[0].category,
            religion: result[0].religion,
            locality: result[0].locality,
            classId: result[0].classId,
            sessionId: result[0].sectionId,
            busService: result[0].busService,
            route: result[0].route,
            studentImage: result[0].images
        }
        res.status(200).json({ status: 1, statusDescription: studentObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the student." });
    }
});
//get student profile details
router.get('/getstudentallresult/:studentId', isTeacherOrStudentOrPrincipal, studentIdParams, async (req, res) => {
    let result = await teacherDB.getStudentResultDetails(req.params.studentId, JSON.parse(req.user.configData).sessionId, JSON.parse(req.user.configData).examOption);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the student." });
    }
});

//************************** */
//Create class Home Work
router.post("/createClassHomeWork", isTeacher, homeWorkObject, async (req, res) => {
    let homeWorkObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        classId: req.body.classId,
        sectionId: req.body.sectionId,
        subjectId: req.body.subjectId,
        mediumType: req.body.mediumType,
        homeWorkDate: req.body.homeWorkDate,
        homeWorkDetails: req.body.homeWorkDetails
    }
    let result;
    let createdUpdate = 'created';
    if (req.body.homeWorkId) {
        createdUpdate = 'updated';
        homeWorkObj.homeWorkId = req.body.homeWorkId;
        result = await teacherDB.updateHomeWorkDetails(homeWorkObj);
    } else {
        result = await teacherDB.createHomeWork(homeWorkObj);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: `Home Work has been ${createdUpdate} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Your principal is not assigned you any class.' });
    }
});
// get homework data for update 
router.get("/getHomeWorktDetailsForUpdate/:homeWorkId", isTeacher, homeWorkIdParams, async (req, res) => {
    let getHomeWorkObj = {
        homeWorkId: req.params.homeWorkId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        accountId: req.user.accountId,
        userId: req.user.userId
    }
    let result = await teacherDB.getHomeWorkDetailsForUpdate(getHomeWorkObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
    }
});

// get homework details
router.get("/getHomeWorktDetails/:homeWorkObject", isTeacherOrprincipalOrStudent, async (req, res) => {
    let homeWork = JSON.parse(req.params.homeWorkObject);
    let getHomeWorkObj = {
        accountId: req.user.accountId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        classId: homeWork.classId,
        sectionId: homeWork.sectionId,
        mediumType: homeWork.mediumType,
        homeWorkDate: homeWork.homeWorkDate
    }
    let result = await teacherDB.getHomeWorkDetails(getHomeWorkObj);
    if (result.length > 0) {
        let resultObj = [];
        result.forEach((row) => {
            resultObj.push({
                homeWorkId: row.homeWorkId,
                subjectId: row.subjectId,
                userId: row.userId,
                homeWorkDetails: row.homeWorkDetails,
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
    }
});
// delete Home Work
router.delete("/deleteHomeWork/:homeWorkId", isTeacher, homeWorkIdParams, async (req, res) => {
    let getHomeWorkObj = {
        homeWorkId: req.params.homeWorkId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        accountId: req.user.accountId,
        userId: req.user.userId
    }
    let result = await teacherDB.deleteHomeWork(getHomeWorkObj);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Home Work has been deleted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to delete the Home Work.' });
    }
});
//************************ */
//Create student Notice
router.post("/createNotice", isTeacher, noticeObject, async (req, res) => {
    let noticeObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        noticeDate: req.body.noticeDate,
        studentNotice: req.body.studentNotice,
        studentId: req.body.studentId
    }
    let result;
    let createdUpdate = 'created';
    if (req.body.noticeId) {
        createdUpdate = 'updated';
        noticeObj.noticeId = req.body.noticeId;
        result = await teacherDB.updateNitice(noticeObj);
    } else {
        result = await teacherDB.createNotice(noticeObj);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: `Notice has been ${createdUpdate} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Your principal is not assigned you any class.' });
    }
});

//get Notice For Update
router.get("/getNoticeForUpdate/:studentId/:noticeId", isTeacher, isTeacherStudentRelated, async (req, res) => {
    let getNoticeObj = {
        sessionId: JSON.parse(req.user.configData).sessionId,
        accountId: req.user.accountId,
        userId: req.user.userId,
        studentId: req.params.studentId,
        noticeId: req.params.noticeId
    }
    let result = await teacherDB.getNoticeForUpdate(getNoticeObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
    }
});
//Delete Notice 
router.delete("/deleteStudentNotice/:studentId/:noticeId", isTeacher, isTeacherStudentRelated, async (req, res) => {
    let deleteNoticeObj = {
        sessionId: JSON.parse(req.user.configData).sessionId,
        accountId: req.user.accountId,
        userId: req.user.userId,
        studentId: req.params.studentId,
        noticeId: req.params.noticeId
    }
    let result = await teacherDB.deleteStudentNotice(deleteNoticeObj);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Notice has been deleted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to delete the Notice.' });
    }
});
// get all student Notice
router.get("/getAllNoticeOfStudent/:studentId", isTeacherOrprincipalOrStudent, studentIdParams, isTeacherStudentRelated, async (req, res) => {
    let getNoticeObj = {
        sessionId: JSON.parse(req.user.configData).sessionId,
        accountId: req.user.accountId,
        userId: req.user.userId,
        studentId: req.params.studentId
    }
    let result = await teacherDB.getAllNoticeOfStudent(getNoticeObj);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
    }
});

//Create Parent Details
router.post("/createParentDetails", isTeacher, parentDetailsObj, async (req, res) => {
    let parentDetailsObject = {
        studentId: req.body.studentId,
        accountId: req.user.accountId,
        userId: req.user.userId,
        motherFirstName: encrypt.encrypt(req.body.motherFirstName),
        motherLastName: encrypt.encrypt(req.body.motherLastName),
        motherCellNumber: encrypt.encrypt(req.body.motherCellNumber),
        motherAAdharNumber: encrypt.encrypt(req.body.motherAAdharNumber),
        motherOccupation: encrypt.encrypt(req.body.motherOccupation),
        motherQualification: encrypt.encrypt(req.body.motherQualification),
        fatherFirstName: encrypt.encrypt(req.body.fatherFirstName),
        fatherLastName: encrypt.encrypt(req.body.fatherLastName),
        fatherCellNumber: encrypt.encrypt(req.body.fatherCellNumber),
        fatherAAdharNumber: encrypt.encrypt(req.body.fatherAAdharNumber),
        fatherOccupation: encrypt.encrypt(req.body.fatherOccupation),
        fatherQualification: encrypt.encrypt(req.body.fatherQualification),
        localGuardianFirstName: encrypt.encrypt(req.body.localGuardianFirstName),
        localGuardianLastName: encrypt.encrypt(req.body.localGuardianLastName),
        localGuardianCellNumber: encrypt.encrypt(req.body.localGuardianCellNumber),
        localGuardianAAdharNumber: encrypt.encrypt(req.body.localGuardianAAdharNumber),
        localGuardianQualification: encrypt.encrypt(req.body.localGuardianQualification),
        localGuardianOccupation: encrypt.encrypt(req.body.localGuardianOccupation),
        siblings: req.body.siblings,
        siblingsDetails: req.body.siblings == 1 ? JSON.stringify(req.body.siblingsDetails) : null,
        physicalDisability: req.body.physicalDisability,
        physicalDisabilityDetails: req.body.physicalDisability == 1 ? req.body.physicalDisabilityDetails : null,
        currentTreatment: req.body.currentTreatment,
        currentTreatmentDetails: req.body.currentTreatment == 1 ? req.body.currentTreatmentDetails : null,
        isStaffChild: req.body.isStaffChild,
        studentBloodGroup: req.body.studentBloodGroup,
        isWeekInSubject: JSON.stringify(req.body.isWeekInSubject)
    }
    if (req.body.motherImage !== '' && req.body.motherImage != null) {
        parentDetailsObject.motherImage = req.body.motherImage.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    if (req.body.fatherImage !== '' && req.body.fatherImage != null) {
        parentDetailsObject.fatherImage = req.body.fatherImage.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    if (req.body.localGuardianImage !== '' && req.body.localGuardianImage != null) {
        parentDetailsObject.localGuardianImage = req.body.localGuardianImage.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    if (req.body.addressProof !== '' && req.body.addressProof != null) {
        parentDetailsObject.addressProof = req.body.addressProof.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    let result = 0;
    let createdUpdate = 'created';
    if (req.body.parentDetailsId) {
        createdUpdate = 'updated';
        parentDetailsObject.Id = req.body.parentDetailsId;
        result = await teacherDB.updateParentDetails(parentDetailsObject);
    } else {
        result = await teacherDB.createStudentParentDetails(parentDetailsObject);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: `Parent Details has been ${createdUpdate} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to save the parent details.' });
    }
});

// get parent Details of Student
router.get("/getParentDetailOfStudent/:studentId", isTeacherOrprincipalOrStudent, studentIdParams, isTeacherStudentRelated, async (req, res) => {
    let getParentDetail = {
        accountId: req.user.accountId,
        studentId: req.params.studentId
    }
    let result = await teacherDB.getParentDetailsOfStudent(getParentDetail);
    if (result.length > 0) {
        let parentObject = {
            motherFirstName: encrypt.decrypt(result[0].motherFirstName),
            motherLastName: encrypt.decrypt(result[0].motherLastName),
            motherCellNumber: encrypt.decrypt(result[0].motherCellNumber),
            motherAAdharNumber: encrypt.decrypt(result[0].motherAAdharNumber),
            motherOccupation: encrypt.decrypt(result[0].motherOccupation),
            motherQualification: encrypt.decrypt(result[0].motherQualification),
            fatherFirstName: encrypt.decrypt(result[0].fatherFirstName),
            fatherLastName: encrypt.decrypt(result[0].fatherLastName),
            fatherCellNumber: encrypt.decrypt(result[0].fatherCellNumber),
            fatherAAdharNumber: encrypt.decrypt(result[0].fatherAAdharNumber),
            fatherOccupation: encrypt.decrypt(result[0].fatherOccupation),
            fatherQualification: encrypt.decrypt(result[0].fatherQualification),
            localGuardianFirstName: encrypt.decrypt(result[0].localGuardianFirstName),
            localGuardianLastName: encrypt.decrypt(result[0].localGuardianLastName),
            localGuardianCellNumber: encrypt.decrypt(result[0].localGuardianCellNumber),
            localGuardianAAdharNumber: encrypt.decrypt(result[0].localGuardianAAdharNumber),
            localGuardianQualification: encrypt.decrypt(result[0].localGuardianQualification),
            localGuardianOccupation: encrypt.decrypt(result[0].localGuardianOccupation),
            siblings: result[0].siblings,
            siblingsDetails: JSON.parse(result[0].siblingsDetails),
            physicalDisability: result[0].physicalDisability,
            physicalDisabilityDetails: result[0].physicalDisabilityDetails,
            currentTreatment: result[0].currentTreatment,
            currentTreatmentDetails: result[0].currentTreatmentDetails,
            isStaffChild: result[0].isStaffChild,
            studentBloodGroup: result[0].studentBloodGroup,
            isWeekInSubject: JSON.parse(result[0].isWeekInSubject),
            motherImage: result[0].motherImage,
            fatherImage: result[0].fatherImage,
            localGuardianImage: result[0].localGuardianImage,
            addressProof: result[0].addressProof,
            Id: result[0].Id
        }
        res.status(200).json({ status: 1, statusDescription: parentObject });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
    }
});

// get parent Details of Student to Update
router.get("/getParentDetailOfStudent/:studentId/:parentDetailsId", isTeacher, studentIdAndId, isTeacherStudentRelated, async (req, res) => {
    let getParentDetail = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        studentId: req.params.studentId,
        Id: req.params.parentDetailsId
    }
    let result = await teacherDB.getParentDetailsOfStudentToUpdate(getParentDetail);
    if (result.length > 0) {
        let parentObject = {
            motherFirstName: encrypt.decrypt(result[0].motherFirstName),
            motherLastName: encrypt.decrypt(result[0].motherLastName),
            motherCellNumber: encrypt.decrypt(result[0].motherCellNumber),
            motherAAdharNumber: encrypt.decrypt(result[0].motherAAdharNumber),
            motherOccupation: encrypt.decrypt(result[0].motherOccupation),
            motherQualification: encrypt.decrypt(result[0].motherQualification),
            fatherFirstName: encrypt.decrypt(result[0].fatherFirstName),
            fatherLastName: encrypt.decrypt(result[0].fatherLastName),
            fatherCellNumber: encrypt.decrypt(result[0].fatherCellNumber),
            fatherAAdharNumber: encrypt.decrypt(result[0].fatherAAdharNumber),
            fatherOccupation: encrypt.decrypt(result[0].fatherOccupation),
            fatherQualification: encrypt.decrypt(result[0].fatherQualification),
            localGuardianFirstName: encrypt.decrypt(result[0].localGuardianFirstName),
            localGuardianLastName: encrypt.decrypt(result[0].localGuardianLastName),
            localGuardianCellNumber: encrypt.decrypt(result[0].localGuardianCellNumber),
            localGuardianAAdharNumber: encrypt.decrypt(result[0].localGuardianAAdharNumber),
            localGuardianQualification: encrypt.decrypt(result[0].localGuardianQualification),
            localGuardianOccupation: encrypt.decrypt(result[0].localGuardianOccupation),
            siblings: result[0].siblings,
            siblingsDetails: JSON.parse(result[0].siblingsDetails),
            physicalDisability: result[0].physicalDisability,
            physicalDisabilityDetails: result[0].physicalDisabilityDetails,
            currentTreatment: result[0].currentTreatment,
            currentTreatmentDetails: result[0].currentTreatmentDetails,
            isStaffChild: result[0].isStaffChild,
            studentBloodGroup: result[0].studentBloodGroup,
            isWeekInSubject: JSON.parse(result[0].isWeekInSubject),
            motherImage: result[0].motherImage,
            fatherImage: result[0].fatherImage,
            localGuardianImage: result[0].localGuardianImage,
            addressProof: result[0].addressProof,
            Id: result[0].Id
        }
        res.status(200).json({ status: 1, statusDescription: parentObject });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
    }
});
/**
* @swagger
* paths:
*     /teacherservice/studentRegistration:
*         post:
*             description: Regisster Student 
*             tags: [Faculty Service]
*             summary: "Register Student, only accessed by Teacher"
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
*                                 mothername:
*                                     type: string
*                                 fathername:
*                                     type: string
*                                 cellnumber:
*                                     type: string
*                                 adharnumber:
*                                     type: string
*                                 dob:
*                                     type: string
*                                 gender:
*                                     type: number
*                                 religion:
*                                     type: number
*                                 category:
*                                     type: number
*                                 locality:
*                                     type: string
*                                 parmanentaddress:
*                                     type: string
*                                 localaddress:
*                                     type: string
*                                 busService:
*                                     type: number
*                                 route: 
*                                     type: number
*                                 images:
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
*     /teacherservice/getStudentDetailsForUpdate/{studentId}:
*       get:
*          description: Get Student Details, only access by Class Teacher  
*          tags: [Faculty Service]
*          summary: Get Student Details for Edit, only access by Class Teacher  
*          parameters:
*              - in: path
*                name: studentId
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
*     /teacherservice/getmystudents:
*      get:
*          description: Get All Students List Of Class, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Details, only access by Class Teacher 
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
*                                   adharnumber: ''
*                                   dob: ''
*                                   gender: ''
*                                   religion: ''
*                                   category: ''
*                                   locality: ''
*                                   parmanentaddress: ''
*                                   localaddress: ''
*                                   busService: ''
*                                   route: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /teacherservice/getmyinactivatedstudents:
*      get:
*          description: Get Inactivated Students List Of Class, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Inactivated students, only access by Class Teacher 
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
*                                   adharnumber: ''
*                                   dob: ''
*                                   gender: ''
*                                   religion: ''
*                                   category: ''
*                                   locality: ''
*                                   parmanentaddress: ''
*                                   localaddress: ''
*                                   busService: ''
*                                   route: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /teacherservice/getAdharnumber/{aadharNumber}:
*       get:
*          description: Verify the AAdhar Number 
*          tags: [Faculty Service]
*          summary: Verify the AAdhar Number  
*          parameters:
*              - in: path
*                name: adharnumber
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
*     /teacherservice/getEmailId/{emailId}:
*       get:
*          description: Verify the emailid 
*          tags: [Faculty Service]
*          summary: Verify the emailid  
*          parameters:
*              - in: path
*                name: emailid
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
*     /teacherservice/assignsubjects:
*       get:
*          description: Get Assign Subjects
*          tags: [Faculty Service]
*          summary: Get Assign Subjects 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/studentResult:
*         post:
*             description: Student Result 
*             tags: [Faculty Service]
*             summary: "Craete Student Result, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 studentId:
*                                     type: number
*                                 subjectid:
*                                     type: number
*                                 totalMarks:
*                                     type: number
*                                 obtainMarks:
*                                     type: number
*                                 examinationtype:
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
*     /teacherservice/studentAttendance:
*         post:
*             description: Student Result 
*             tags: [Faculty Service]
*             summary: "Craete Student Result, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 studentId:
*                                     type: number
*                                 monthName:
*                                     type: number
*                                 totalClasses:
*                                     type: number
*                                 presentClasses:
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
*     /teacherservice/getfeedetailsforteacher:
*       get:
*          description: Get Fee Details
*          tags: [Faculty Service]
*          summary: Get Fee Details for Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/getstudentsresult:
*      get:
*          description: Get Student Result, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Result, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/getstudentsattendance:
*      get:
*          description: Get Student Attendance, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Attendance, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/getTeacherDetails:
*      get:
*          description: Get Student Attendance, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Attendance, only access by Class Teacher 
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
*                                   dob: ''
*                                   cellnumber: ''
*                                   localaddress: ''
*                                   parmanentaddress: ''
*                                   qualification: ''
*                                   classid: ''
*                                   section: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /teacherservice/inactivatestudent:
*         post:
*             description: Inactivate Student
*             tags: [Faculty Service]
*             summary: "Inactivate Student, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
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
*     /teacherservice/reactivatestudent:
*         post:
*             description: Reactivate Student
*             tags: [Faculty Service]
*             summary: "Reactivate Student, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
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
*     /teacherservice/getStudentRegistrationDetails/{aadharNumber}:
*      get:
*          description: Get Student Registration Details, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Student Registration Details, only access by Class Teacher 
*          parameters:
*              - in: path
*                name: adharnumber
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
*     /teacherservice/savedailyattendance:
*         post:
*             description: Reactivate Student
*             tags: [Faculty Service]
*             summary: "Reactivate Student, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 accountid:
*                                     type: string
*                                 userId:
*                                     type: number
*                                 studentId:
*                                     type: number
*                                 classid:
*                                     type: number
*                                 section:
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
*     /teacherservice/getdailyattendance:
*      get:
*          description: Get Daily Attendance, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Daily Attendance, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*/


module.exports = router;