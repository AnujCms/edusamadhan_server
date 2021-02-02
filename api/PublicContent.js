const router = require('express').Router();
const PublicContentDB = require("../database/PublicContentDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/examination.js');
const middleWare = require('../apiJoi/middleWare.js');
const generator = require('generate-password');
const encrypt = require('../utils/encrypt');

//get All Users
router.get("/getAllSchoolsName", async (req, res) => {
    let schoolList = await PublicContentDB.getAllSchoolsName();
    if (schoolList.length > 0) {
        let schoolObj = [];
        schoolList.forEach((row) => {
            schoolObj.push({
                accountId: row.accountId,
                accountName: encrypt.decrypt(row.accountName),
                accountAddress: row.accountAddress
            });
        });
        res.status(200).json({ status: 1, statusDescription: schoolObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get fee details
router.get("/getSchoolsFeeDetails/:accountId", async (req, res) => {
    let result = await PublicContentDB.getSchoolsFeeDetails(req.params.accountId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get All Users
router.get("/getAllFaculyDetails/:accountId", async (req, res) => {
    let result = await PublicContentDB.getAllFacultyDetails(req.params.accountId);
    if (result.length > 0) {
        let facultyArray = [];
        result.map((item) => {
            facultyArray.push({
                facultyName: encrypt.decrypt(item.firstName) + " " + encrypt.decrypt(item.lastName),
                cellNumber: encrypt.decrypt(item.cellNumber),
                userrole: item.userrole,
                gender: item.gender,
                qualification: item.qualification,
                subject: item.subject,
                images: item.images
            })
        })
        res.status(200).json({ status: 1, statusDescription: facultyArray });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

// ***********************
//get users message
router.get("/getUsersMessage/:userRole/:accountId", async (req, res) => {
    let result = await PublicContentDB.getUserMessage(req.params.userRole, req.params.accountId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get Achievements
router.get("/getAchievement/:classId/:accountId", async (req, res) => {
    let result = await PublicContentDB.getAchievement(req.params.accountId, req.params.classId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get users message
router.get("/getMediaDetails/:mediaType/:accountId", async (req, res) => {
    let result = await PublicContentDB.getMediaDetails(req.params.accountId, req.params.mediaType);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get facility details 
router.get("/getFacilityDetails/:accountId", async (req, res) => {
    let result = await PublicContentDB.getFacilityDetails(req.params.accountId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get public content URL
router.get("/getPublicContentUrl/:accountId/:contentType", async (req, res) => {
    let result = await PublicContentDB.getPublicContentUrl(req.params.accountId, req.params.contentType);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});
// *************************School Details
//getSchoolInformation
router.get("/getSchoolInformation/:accountId", async (req, res) => {
    let result = await PublicContentDB.getSchoolInformation(req.params.accountId);
    if (result.length > 0) {
        let schoolObj = {
            accountName: encrypt.decrypt(result[0].accountName),
            phoneNumber: encrypt.decrypt(result[0].phoneNumber),
            accountAddress: result[0].accountAddress,
            schoolLogo: result[0].schoolLogo
        }
        res.status(200).json({ status: 1, statusDescription: schoolObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});
// ********************** BOOKS
//get Dubject Details
router.get("/getSubjectsOfClass/:classId", async (req, res) => {
    let result = await PublicContentDB.getSubjectsDetails(req.params.classId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get Books Of Subject
router.get("/getBooksOfSubject/:classId/:subjectId", async (req, res) => {
    let result = await PublicContentDB.getBooksOfSubject(req.params.classId, req.params.subjectId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});

//get Book Details 
router.get("/getBookDetails/:classId/:subjectId/:numberOfBook", async (req, res) => {
    let result = await PublicContentDB.getBookDetails(req.params.classId, req.params.subjectId, req.params.numberOfBook);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "No record found to display." });
    }
});
module.exports = router;