const router = require('express').Router();
const superAdminDB = require("../database/SuperAdminDB.js");
const UserEnum = require('../lookup/UserEnum');
const encrypt = require("../utils/encrypt.js");
const uuid = require('uuid');
const publisher = require('../pubsub/publisher');
const generator = require('generate-password');
const joiSchema = require('../apiJoi/superadmin.js');
const middleWare = require('../apiJoi/middleWare.js');

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

const isSuperAdminRole = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.SuperAdmin) {
        return next();
    }
    res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
};

//middleware for JOI
const schoolObject = middleWare(joiSchema.schoolObject, "body", true);
const accountIdParams = middleWare(joiSchema.accountIdParams, "params", true);

//get all the schools
router.get("/all", isSuperAdminRole, async (req, res) => {
    let results = await superAdminDB.getAllAccountsForSuperAdmin();
    if (results.length > 0) {
        results.forEach((result) => {
            result.accountName = encrypt.decrypt(result.accountName);
            result.accountId = result.accountId;
        });
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the account list.' });
    }

});
//get teachers of selected account
router.get("/:accountId/teachersforselectedaccount/all", isSuperAdminRole, async (req, res) => {
    let results = await superAdminDB.getAllTeachersByAccountSuperAdmin(req.params.accountId);
    if (results.length > 0) {
        let teacherObj = [];
        results.forEach((result) => {
            teacherObj.push({
                userId: result.userId,
                firstName: encrypt.decrypt(result.firstName),
                lastName: encrypt.decrypt(result.lastName),
                fullName: encrypt.decrypt(result.lastName) + " " + encrypt.decrypt(result.firstName),
                cellNumber: encrypt.decrypt(result.cellNumber),
                emailId: encrypt.decrypt(result.emailId),
                userrole: getKeyByValue(UserEnum.UserRoles, result.userrole),
                status: getKeyByValue(UserEnum.UserStatus, result.status),
            })

        });
        res.status(200).json({ status: 1, statusDescription: teacherObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get teachers list.' });
    }
});
//get students of selected teacher by superAdmin
router.get("/:accountId/:teacherId/students", isSuperAdminRole, async (req, res) => {
    let result = await superAdminDB.getAllStudentsBySuperAdmin(req.params.accountId, req.params.teacherId, UserEnum.StudentStatus.Active);
    if (result.length > 0) {
        let studentObj = [];
        result.forEach((row) => {
            studentObj.push({
                studentId: row.userId,
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
                busService: row.busService,
                images: row.images
            });
        });
        res.status(200).json({ status: 1, statusDescription: studentObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get teachers list.' });
    }
});
//create school Admin
router.post("/createschooladmin", isSuperAdminRole, schoolObject, async (req, res) => {
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
    let encryptedImage;
    if (req.body.images !== '' && req.body.images != null) {
        encryptedImage = image.replace(/^data:image\/[a-z]+;base64,/, "");
    }

    let imgLogo = req.body.schoolLogo;
    let logo;
    if (imgLogo == null) {
        logo = imgLogo
    } else if (imgLogo.length == 0) {
        logo = null
    } else {
        logo = imgLogo
    }
    let encryptedLogo;
    if (req.body.schoolLogo !== '' && req.body.schoolLogo != null) {
         encryptedLogo = logo.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    let data = req.body;
    let adminObj = {
        firstName: encrypt.encrypt(data.firstName),
        lastName: encrypt.encrypt(data.lastName),
        dob: encrypt.encrypt(data.dob),
        emailId: encrypt.encrypt(data.emailId),
        userrole: UserEnum.UserRoles.Director,
        username: encrypt.computeHash(data.emailId),
        cellNumber: encrypt.encrypt(data.cellNumber),
        aadharNumber: encrypt.encrypt(data.aadharNumber),
        gender: data.gender,
        sessionId: data.sessionId,
        images: encryptedImage
    };

    let accountObj = {
        accountName: encrypt.encrypt(data.schoolName),
        accountRefNumber: encrypt.encrypt(data.registration),
        phoneNumber: encrypt.encrypt(data.phoneNumber),
        schoolLogo: encryptedLogo,
        accountAddress: data.schoolAddress
    }
    let configObj;
    if (data.configType) {
        configObj = {
            accountId: accountObj.accountId,
            sessionId: data.sessionId,
            accountant: data.accountant,
            examination: data.examination,
            configType: data.configType,
            examOption: data.examOption,
            examinationType: data.examinationType,
            accountName: encrypt.encrypt(data.schoolName),
        };
    }
    const publishEvent = {
        "emailId": "anujvermaatc1994@gmail.com",
        "principalName": req.body.firstname + " " + req.body.lastname,
        "schoolName": req.body.schoolname,
        "tempPassword": password,
        "userRole": "Principal"
    }
    let configData = { "configData": JSON.stringify(configObj) }
    let result = 0;
    let message = "created";
    if (req.body.accountId) {
        result = await superAdminDB.updateSchoolAdmin(req.body.accountId, adminObj, accountObj, configData);
        message = "updated";
    } else {
        adminObj.status= UserEnum.UserStatus.Pending;
        adminObj.passwordChangeCount = 0;
        adminObj.wrongPasswordCount = 0;
        adminObj.password = encrypt.getHashedPassword(data.aadharNumber);
        accountObj.accountStatus = UserEnum.AccountStatus.Active;
        accountObj.accountId = uuid.v1();
        result = await superAdminDB.createSchoolAdmin(adminObj, accountObj, configData);
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `School account has been ${message} successfully.` });
        // publisher.publishEmailEventForCreateDirector(publishEvent);
    } else {
        res.status(200).json({ status: 0, statusDescription: `Not able to ${message} school account details.` });
    }
});

//get the school account information for update
router.get("/getschooldetails/:accountId", isSuperAdminRole, accountIdParams, async (req, res) => {
    let results = await superAdminDB.getSchoolAccountDetailsForUpdate(req.params.accountId);
    if (results.length > 0) {
        let schoolObj = [];
        results.forEach((result) => {
            schoolObj.push({
                accountId: result.accountId,
                accountStatus: result.accountStatus,
                accountName: encrypt.decrypt(result.accountName),
                phoneNumber: encrypt.decrypt(result.phoneNumber),
                accountRefNumber: encrypt.decrypt(result.accountRefNumber),
                firstName: encrypt.decrypt(result.firstName),
                lastName: encrypt.decrypt(result.lastName),
                cellNumber: encrypt.decrypt(result.cellNumber),
                aadharNumber: encrypt.decrypt(result.aadharNumber),
                emailId: encrypt.decrypt(result.emailId),
                dob: encrypt.decrypt(result.dob),
                accountAddress: result.accountAddress,
                configData: JSON.parse(result.configData),
                gender: result.gender,
                sessionId: result.sessionId,
                images: result.images,
                schoolLogo: result.schoolLogo
            })
        });
        res.status(200).json({ status: 1, statusDescription: schoolObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the School details.' });
    }
});
//get all school admin details for manage account
router.get("/getallschooladmin", isSuperAdminRole, async (req, res) => {
    let results = await superAdminDB.getAllSchoolAdminDetailsForManage();
    if (results.length > 0) {
        let adminObj = [];
        results.forEach((result) => {
            adminObj.push({
                accountId: result.accountId,
                accountStatus: result.accountStatus,
                accountName: encrypt.decrypt(result.accountName),
                phoneNumber: encrypt.decrypt(result.phoneNumber),
                accountRefNumber: encrypt.decrypt(result.accountRefNumber),
                firstName: encrypt.decrypt(result.firstName),
                lastName: encrypt.decrypt(result.lastName),
                cellNumber: encrypt.decrypt(result.cellNumber),
                aadharNumber: encrypt.decrypt(result.aadharNumber),
                emailId: encrypt.decrypt(result.emailId),
                images: result.images,
                schoolLogo: result.schoolLogo,
                status: result.status,
                userId: result.userId,
                userrole: result.userrole
            })
        });
        res.status(200).json({ status: 1, statusDescription: adminObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the School details.' });
    }
});

//Lock the account
router.put("/lockaccount/:accountId", isSuperAdminRole, accountIdParams, async (req, res) => {
    let results = await superAdminDB.lockSchoolAdmin(UserEnum.AccountStatus.Locked, req.params.accountId);
    if (results == 1) {
        res.status(200).json({ status: 1, statusDescription: 'School account has been successfully locked.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the School details.' });
    }
});
//UnLock the account
router.put("/unlockaccount/:accountId", isSuperAdminRole, accountIdParams, async (req, res) => {
    let results = await superAdminDB.unlockSchoolAdmin(UserEnum.AccountStatus.Active, req.params.accountId);
    if (results == 1) {
        res.status(200).json({ status: 1, statusDescription: 'School account has been successfully unlocked.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the School details.' });
    }
});

module.exports = router;