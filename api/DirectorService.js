const router = require('express').Router();
const directorDB = require("../database/directorDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/director.js');
const middleWare = require('../apiJoi/middleWare.js');
const generator = require('generate-password');
const { checkDirectorAndUserBelongsToSameAccount } = require('./ValidationFunctions');
const encrypt = require('../utils/encrypt');

//middlewares
let isDirector = (req, res, next) =>{
    if (req.user.role === UserEnum.UserRoles.Director) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}

//Joi Validations 
const createUserObject = middleWare(joiSchema.createUserObject, "body", true);
const userIdParams = middleWare(joiSchema.userIdParams, "params", true);

//get All Users
router.get("/getAllUsers", isDirector, async (req, res) => {
    let userRoleToAccess = [UserEnum.UserRoles.Principal, UserEnum.UserRoles.Manager];
    let userList = await directorDB.getAllUsers(req.user.accountId, userRoleToAccess);
    if (userList.length > 0) {
        let userObj = [];
        userList.forEach((row) => {
            userObj.push({
                userId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                emailId: encrypt.decrypt(row.emailId),
                cellNumber: encrypt.decrypt(row.cellNumber),
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                status: row.status,
                userrole: row.userrole,
                qualification: row.qualification,
                images:row.images,
                subject: row.subject,
                salary: row.salary,
                userType: row.userType
            });
        });
        res.status(200).json({ status: 1, statusDescription: userObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No user found for you." });
    }
});

//create or Update user only accessed by director
router.post("/createUser", isDirector, createUserObject, async (req, res) => {
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
    if(req.body.images !== '' && req.body.images != null){
        encryptimg =  image.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    let userObject = {
        firstName: encrypt.encrypt(req.body.firstName),
        lastName: encrypt.encrypt(req.body.lastName),
        emailId: encrypt.encrypt(req.body.emailId.toLowerCase()),
        userName: encrypt.computeHash(req.body.emailId.toLowerCase()),
        cellNumber: encrypt.encrypt(req.body.cellNumber),
        aadharNumber: encrypt.encrypt(req.body.aadharNumber),
        dob: encrypt.encrypt(req.body.dob),
        gender: req.body.gender,
        qualification: req.body.qualification,
        subject: req.body.subject,
        parmanentAddress: req.body.parmanentAddress,
        localAddress: req.body.localAddress,
        userrole: req.body.userrole,
        images: encryptimg,
        sessionId:JSON.parse(req.user.configData).sessionId,
        salary: req.body.salary,
        workExperience: req.body.workExperience,
        educationalAwards: req.body.educationalAwards
    };

    if(req.body.educationalAwards == 1){
        userObject.awardDetails = req.body.awardDetails;
    }

    let userRole = '';
    if(req.body.userrole === 3){
        userRole = "Principal"
    }else if(req.body.userrole === 4){
        userRole = "Manager"
    }
    let result = '';
    let createUpdate = 'created';
    let publishEvent = {
        "emailId": req.body.emailId.toLowerCase(),
        "staffName": req.body.firstName + " " + req.body.lastName,
        "schoolName": req.user.accountName,
        "principalName": req.user.firstName + " " + req.user.lastName,
        "tempPassword": password,
        "userRole": userRole
    }
    if(req.body.userId){
        createUpdate = 'updated'
        // publisher.publishEmailEventForCreatePrincipal(publishEvent);
        result = await directorDB.updateUserDetails(userObject, req.body.userId, req.user.accountId, req.body.userType);
    }else{
        userObject.password = encrypt.getHashedPassword(req.body.aadharNumber);
        userObject.status = UserEnum.UserStatus.Pending;
        userObject.wrongPasswordCount = 0;
        result = await directorDB.createUser(userObject, req.user.userId, req.user.accountId, req.body.userType);
        if(result == 1){
            // publisher.publishEmailEventForCreatePrincipal(publishEvent);
        }
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `${userRole} has been ${createUpdate} successfully.` });
    } else if(result == 2){
        res.status(200).json({ status: 0, statusDescription: `You can not create multiple ${userRole} for same position.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: `${userRole} is not ${createUpdate}.` });
    }
});

//delete student 
router.delete("/deleteUserDetails/:userId", isDirector, userIdParams, checkDirectorAndUserBelongsToSameAccount, async (req, res) => {
    let deleteUserObj = {
        userId: req.params.userId,
        directorId: req.user.userId,
        sessionId:JSON.parse(req.user.configData).sessionId,
        accountId: req.user.accountId,
        status: UserEnum.UserStatus.Pending
    }
    let result = await directorDB.deleteUserDetails(deleteUserObj);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: "User has been deleted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No able to delete user." });
    }
});

//get user details only accessed by director
router.get("/getUserDetailForUpdate/:userId", isDirector, userIdParams, checkDirectorAndUserBelongsToSameAccount, async function (req, res) {
    let result = await directorDB.getUserDetailForUpdate(req.params.userId);
    if (result.length > 0) {
        let row = result[0];
        let userObject = {
            userId: row.userId,
            firstName: encrypt.decrypt(row.firstName),
            lastName: encrypt.decrypt(row.lastName),
            emailId: encrypt.decrypt(row.emailId),
            cellNumber: encrypt.decrypt(row.cellNumber),
            aadharNumber: encrypt.decrypt(row.aadharNumber),
            dob: encrypt.decrypt(row.dob),
            gender: row.gender,
            status: row.status,
            userrole: row.userrole,
            qualification: row.qualification,
            workExperience: row.workExperience,
            educationalAwards: row.educationalAwards,
            awardDetails: row.awardDetails,
            images:row.images,
            subject: row.subject,
            localAddress: row.localAddress,
            parmanentAddress: row.parmanentAddress,
            salary: row.salary,
            userType: row.userType
        };
        res.status(200).json({ status: 1, statusDescription: userObject })
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get use details.' })
    }
});


module.exports = router;