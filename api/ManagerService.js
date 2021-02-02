const router = require('express').Router();
const managerDB = require("../database/managerDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/manager.js');
const middleWare = require('../apiJoi/middleWare.js');
const generator = require('generate-password');
const publisher = require('../pubsub/publisher');
const encrypt = require('../utils/encrypt');

//middlewares
let isManager = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Manager) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
let isManagerOrExamHead = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Manager || req.user.role === UserEnum.UserRoles.ExamHead) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}

let isManagerorPrincipal = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Manager || req.user.role === UserEnum.UserRoles.Principal) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}

//Check User and Student Beelongs to same School
let checkStudentAndUserBelongsToSameSchool = async (req, res, next) =>{
    let result = await managerDB.checkRelationStudentAndUser(req.user.accountId, req.params.studentId);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Student and User are not belongs to same account." });
    }  
}
//Joi Validations  
const createStudentObject = middleWare(joiSchema.createStudentObject, "body", true);
const classIdAndSectionParams = middleWare(joiSchema.classIdAndSectionParams, "params", true);
const studentIdParams = middleWare(joiSchema.studentIdParams, "params", true);
const achievemetnObj = middleWare(joiSchema.achievemetnObj, "body", true);
const userMessage = middleWare(joiSchema.userMessage, "body", true);
const mediaObj = middleWare(joiSchema.mediaObj, "body", true);
const facilityObj = middleWare(joiSchema.facilityObj, "body", true);

//create or Update Student only accessed by Manager
router.post("/createStudent", isManagerOrExamHead, createStudentObject, async (req, res) => {
    let userObject = {
        firstName: encrypt.encrypt(req.body.firstName),
        lastName: encrypt.encrypt(req.body.lastName),
        dob: encrypt.encrypt(req.body.dob),
        userName: encrypt.computeHash(req.body.aadharNumber),
        cellNumber: encrypt.encrypt(req.body.cellNumber),
        aadharNumber: encrypt.encrypt(req.body.aadharNumber),
        classId: req.body.classId,
        sectionId: req.body.sectionId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        mediumType: req.body.mediumType
    };
    let result = '';
    let createUpdate = 'created';
    // let publishEvent = {
    //     "emailId": req.body.emailid.toLowerCase(),
    //     "staffName": req.body.firstname + " " + req.body.lastname,
    //     "schoolName": req.user.accountname,
    //     "principalName": req.user.firstname + " " + req.user.lastname,
    //     "tempPassword": password,
    //     "userRole": userRole
    // }
    if (req.body.studentId) {
        createUpdate = 'updated'
        let publishEvent = {
            "otp": "1111",
            "ph":  "9648340892",
            "hashcode": "1111",
            "routingKey" : "SmsEvent",
        }
        // publisher.publishWelcomeSmsToStudent(publishEvent);
        result = await managerDB.updateStudentDetails(userObject, req.body.studentId, req.user.accountId);
    } else {
        userObject.status = req.user.userType == 2 ? UserEnum.StudentStatus.Pending : UserEnum.StudentStatus.Pramoted;
        userObject.userrole = UserEnum.UserRoles.Student;
        userObject.password = encrypt.getHashedPassword(req.body.aadharNumber);
        userObject.wrongPasswordCount = 0;
        result = await managerDB.createStudent(userObject, req.user.userId, req.user.accountId, req.user.userType);
        if (result == 1) {
            let publishEvent = {
                "otp": "1111",
                "ph":  "9648340892",
                "hashcode": "1111",
                "routingKey" : "SmsEvent",
            }
            publisher.publishWelcomeSmsToStudent(publishEvent);
        }
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: `Student has been ${createUpdate} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: `Student is not created.` });
    }
});

//get student for update 
router.get("/getStudentDetailsForUpdate/:studentId", isManagerOrExamHead, studentIdParams, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let getStudentObj = {
        studentId: req.params.studentId,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let studentList = await managerDB.getStudentDetailsForUpdate(getStudentObj);
    if (studentList.length > 0) {
        let userObj = [];
        studentList.forEach((row) => {
            userObj.push({
                studentId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                dob: encrypt.decrypt(row.dob),
                status: row.status,
                userrole: row.userrole,
                mediumType: row.mediumType,
                classId: row.classId,
                sectionId: row.sectionId
            });
        });
        res.status(200).json({ status: 1, statusDescription: userObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//delete student 
router.delete("/deleteStudentDetails/:studentId", isManagerOrExamHead, studentIdParams, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let deleteStudentObj = {
        studentId: req.params.studentId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        accountId: req.user.accountId
    }
    let result = await managerDB.deleteStudentDetails(deleteStudentObj);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: "Student has been deleted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No able to delete student." });
    }
});

//get All Registered Student
router.get("/getAllStudentOfClass/:classId/:sectionId", isManagerOrExamHead, classIdAndSectionParams, async (req, res) => {
    let getStudentObj = {
        classId: req.params.classId,
        sectionId: req.params.sectionId,
        accountId: req.user.accountId,
        sessionId: JSON.parse(req.user.configData).sessionId
    }
    let studentList = await managerDB.getAllRegisteredStudentsOfClass(getStudentObj, req.user.userType);
    if (studentList.length > 0) {
        let userObj = [];
        studentList.forEach((row) => {
            userObj.push({
                studentId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                dob: encrypt.decrypt(row.dob),
                status: row.status,
                userrole: row.userrole,
                mediumType: row.mediumType
            });
        });
        res.status(200).json({ status: 1, statusDescription: userObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get user details only accessed by director
router.get("/getUserType", isManagerorPrincipal, async (req, res) => {
    let result = await managerDB.getUserType(req.user.userId);
    if (result.length > 0) {
        let row = result[0];
        let userObj = {
            userType: row.userType
        };
        res.status(200).json({ status: 1, statusDescription: userObj })
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get user details.' })
    }
});

// ********************************
//Create users message
router.post("/createUserMessage", isManager, userMessage, async (req, res) => {
    let userResult = await managerDB.getUserDetails(req.user.accountId, req.body.messageUser, req.user.userType);
    if (userResult.length == 1) {
        let userName = encrypt.decrypt(userResult[0].firstName) + " " + encrypt.decrypt(userResult[0].lastName)
        let messageObj = {
            messageUser: req.body.messageUser,
            userMessage: JSON.stringify({ message: req.body.userMessage, userType: req.user.userType, userName:userName, accountName: req.user.accountName }),
            images: req.body.images.replace(/^data:image\/[a-z]+;base64,/, ""),
            accountId: req.user.accountId,
            userType: req.user.userType
        }
        let result = 0;
        let dataSave = 'saved';
        if (req.body.msgId) {
            dataSave = 'updated';
            messageObj.msgId = req.body.msgId;
            result = await managerDB.updateUserMessage(messageObj);
        } else {
            result = await managerDB.saveUserMessage(messageObj);
        }
        if (result == 1) {
            res.status(200).json({ status: 1, statusDescription: `Message has been ${dataSave} successfully.` });
        } else {
            res.status(200).json({ status: 0, statusDescription: 'Not able to save the message.' });
        }
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to save the message.' });
    }
});

//get users message
router.get("/getUsersMessage/:userRole", async (req, res) => {
    let result = await managerDB.getUserMessage(req.user.accountId, req.params.userRole, req.user.userType);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

// ********************************
//Create users message
router.post("/createAcievement", isManager, achievemetnObj, async (req, res) => {
        let achievementObj = {
            achievementsData: JSON.stringify({ message: req.body.userMessage, userType: req.user.userType, studentName:req.body.studentName, percentage:req.body.percentage, accountName: req.user.accountName }),
            images: req.body.images.replace(/^data:image\/[a-z]+;base64,/, ""),
            accountId: req.user.accountId,
            userType: req.user.userType,
            sessionId: JSON.parse(req.user.configData).sessionId,
            classId: req.body.classId
        }
        let result = 0;
        let dataSave = 'saved';
        if (req.body.achievementId) {
            dataSave = 'updated';
            achievementObj.achievementId = req.body.achievementId;
            result = await managerDB.updateAchievement(achievementObj);
        } else {
            result = await managerDB.saveAchievement(achievementObj);
        }
        if (result == 1) {
            res.status(200).json({ status: 1, statusDescription: `Achievement has been ${dataSave} successfully.` });
        } else {
            res.status(200).json({ status: 0, statusDescription: 'Not able to save the Achievement.' });
        }
});

//get users message
router.get("/getAchievement/:classId", async (req, res) => {
    let result = await managerDB.getAchievement(req.user.accountId, req.params.classId, req.user.userType);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get users message
router.get("/getAchievementById/:achievementId", async (req, res) => {
    let result = await managerDB.getAchievementById(req.user.accountId, req.params.achievementId, req.user.userType);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

// ********************************
//Manage the galary
router.post("/createGalaryImage", isManager, mediaObj, async (req, res) => {
    let mediaObject = {
        accountId: req.user.accountId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        userType: req.user.userType,
        mediaType: req.body.mediaType,  
        mediaTitle: req.body.mediaTitle,      
        images: req.body.images.replace(/^data:image\/[a-z]+;base64,/, "")
    }
    let result = 0;
    let dataSave = 'saved';
    if (req.body.mediaId) {
        dataSave = 'updated';
        mediaObject.mediaId = req.body.mediaId;
        result = await managerDB.updateMediaDetails(mediaObject);
    } else {
        result = await managerDB.saveMediaDetails(mediaObject);
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `Media has been ${dataSave} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to save the Media.' });
    }
});

//get media details 
router.get("/getMediaDetails/:mediaType", async (req, res) => {
let result = await managerDB.getMediaDetails(req.user.accountId, req.params.mediaType, req.user.userType);
if (result.length > 0) {
    res.status(200).json({ status: 1, statusDescription: result });
} else {
    res.status(200).json({ status: 0, statusDescription: "No record found to display." });
}
});

//get media details by Id
router.get("/getMediaDetailsById/:mediaId", async (req, res) => {
let result = await managerDB.getMediaDetailsById(req.user.accountId, req.params.mediaId, req.user.userType);
if (result.length > 0) {
    res.status(200).json({ status: 1, statusDescription: result });
} else {
    res.status(200).json({ status: 0, statusDescription: "No record found to display." });
}
});

// ***************************** Facility
//Manage the Facility
router.post("/createFacilityDetails", isManager, facilityObj, async (req, res) => {
    let mediaObject = {
        accountId: req.user.accountId,
        faculityType: req.body.faculityType,  
        facilityDetails: req.body.facilityDetails,      
        images: req.body.images.replace(/^data:image\/[a-z]+;base64,/, "")
    }
    let result = 0;
    let dataSave = 'saved';
    if (req.body.faculityId) {
        dataSave = 'updated';
        mediaObject.faculityId = req.body.faculityId;
        result = await managerDB.updateFacilityDetails(mediaObject);
    } else {
        result = await managerDB.saveFacilityDetails(mediaObject);
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `Facility Detail has been ${dataSave} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to save the Facility Detail.' });
    }
});

//get facility details 
router.get("/getFacilityDetails", async (req, res) => {
let result = await managerDB.getFacilityDetails(req.user.accountId);
if (result.length > 0) {
    res.status(200).json({ status: 1, statusDescription: result });
} else {
    res.status(200).json({ status: 0, statusDescription: "No record found to display." });
}
});

//get facility details by Id
router.get("/getFacilityDetailsById/:faculityId", async (req, res) => {
let result = await managerDB.getFacilityDetailsById(req.user.accountId, req.params.faculityId);
if (result.length > 0) {
    res.status(200).json({ status: 1, statusDescription: result });
} else {
    res.status(200).json({ status: 0, statusDescription: "No record found to display." });
}
});
module.exports = router;