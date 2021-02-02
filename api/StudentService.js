const router = require('express').Router();
const studentDB = require("../database/StudentDB.js");
const UserEnum = require('../lookup/UserEnum');
const encrypt = require("../utils/encrypt.js");
const joiSchema = require('../apiJoi/students.js');
const middleWare = require('../apiJoi/middleWare.js'); 

function isStudent(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Student || req.user.role === UserEnum.UserRoles.EntranceStudent) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}

//get student details
router.get("/getstudentdetails", isStudent, async function (req, res) {
        let result = await studentDB.getStudentDetails(req.user.userid);
            if (result.length > 0) {
                let row = result[0]
                let resultObj = {
                    firstname: encrypt.decrypt(row.firstname),
                    lastname: encrypt.decrypt(row.lastname),
                    mothername: row.mothername,
                    fathername: row.fathername,
                    cellnumber: encrypt.decrypt(row.cellnumber),
                    dob: encrypt.decrypt(row.dob),
                    adharnumber: row.adharnumber,
                    userrole: row.userrole,
                    gender: row.gender,
                    religion: row.religion,
                    category: row.category,
                    locality: row.locality,
                    localaddress: row.localaddress,
                    parmanentaddress: row.parmanentaddress,
                    class: row.classid,
                    section: row.section,
                    session: row.session,
                    image: row.images
                }
                res.status(200).json({status:1, statusDescription:resultObj});
            } else {
                res.status(200).json({status:0, statusDescription:'Not able to get the student details.'});
            }
})

//get teacherid
router.get("/getteacherid", isStudent, async function (req, res) {
    let result = await studentDB.getTeacheridByStudent(req.user.userid);
        if (result.length > 0) {
            res.status(200).json({status:1, statusDescription:result[0].teacherid});
        } else {
            res.status(200).json({status:0, statusDescription:'Not able to get the student details.'});
        }
})

//get Student Attendance for student
router.get("/studentattendance", isStudent, async function (req, res) {
    let result = await studentDB.getAttendancesForStudent(req.user.teacherid, req.user.studentid,  JSON.parse(req.user.configdata).session);
            if (result.length > 0) {
                let resultObj = {
                    studentid: result[0].studentid,
                    january: result[0].january,
                    jtd: result[0].jtd,
                    jpd: result[0].jpd,
                    february: result[0].february,
                    ftd: result[0].ftd,
                    fpd: result[0].fpd,
                    march: result[0].march,
                    mtd: result[0].mtd,
                    mpd: result[0].mpd,
                    april: result[0].april,
                    atd: result[0].atd,
                    apd: result[0].apd,
                    may: result[0].may,
                    matd: result[0].matd,
                    mapd: result[0].mapd,
                    june: result[0].june,
                    juntd: result[0].juntd,
                    junpd: result[0].junpd,
                    july: result[0].july,
                    jultd: result[0].jultd,
                    julpd: result[0].julpd,
                    august: result[0].august,
                    autd: result[0].autd,
                    aupd: result[0].aupd,
                    september: result[0].september,
                    std: result[0].std,
                    spd: result[0].spd,
                    october: result[0].october,
                    otd: result[0].otd,
                    opd: result[0].opd,
                    november: result[0].november,
                    ntd: result[0].ntd,
                    npd: result[0].npd,
                    december: result[0].december,
                    dtd: result[0].dtd,
                    dpd: result[0].dpd
                };
                res.status(200).json({status:1, statusDescription:resultObj});
            } else {
                res.status(200).json({ status: 0, statusDescription: "Not able to get student attendance details." });
            }
})
//get assign subjects for student
// router.post("/:studentid/assignsubjects", isStudent, async function (req, res) {
//     console.log('sdfghjk')
//         let result = await studentDB.getAssignSubjectForStudent(req.user.studentclass);
//             if (result.length > 0) {
//                 res.status(200).json({status:1, statusDescription:result});
//             }else{
//                 res.status(200).json({ status: 0, statusDescription: "Not able to get student subjects details." });
//             }

// })
//get Student Result for Student
// router.post("/:studentid/getresult", isStudent, async function (req, res) {
//     let result = await studentDB.getStudentResultForStudent(req.user.teacherid, req.user.studentid);
//             if (result.length > 0) {
//                 var resultObj = {
//                     studentid: result[0].studentid,
//                     hindi: result[0].hindi,
//                     hindiobtainmarks: result[0].hindiobtainmarks,
//                     english: result[0].english,
//                     englishobtainmarks: result[0].englishobtainmarks,
//                     math: result[0].math,
//                     mathobtainmarks: result[0].mathobtainmarks,
//                     science: result[0].science,
//                     scienceobtainmarks: result[0].scienceobtainmarks,
//                     history: result[0].history,
//                     historyobtainmarks: result[0].historyobtainmarks,
//                     physics: result[0].physics,
//                     physcisobtainmarks: result[0].physcisobtainmarks,
//                     chemistry: result[0].chemistry,
//                     chemistryobtainmarks: result[0].chemistryobtainmarks
//                 };
//                 res.status(200).json({status:1, statusDescription:resultObj});
//             } else {
//                 res.status(200).json({ status: 0, statusDescription: "Not able to get student result details." });
//             }
// })

/**
* @swagger
* paths:
*     /studentservice/getstudentdetails:
*      get:
*          description: Get student details
*          tags: [Student Service]
*          summary: Get student details, Only accessed by student 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentservice/getteacherid:
*      get:
*          description: Get class teacher id
*          tags: [Student Service]
*          summary: Get class teacher id, Only accessed by student 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentservice/updateProfileDetails:
*         post:
*             description: Update Profile of Student
*             tags: [Student Service]
*             summary: "Update Profile of Student, only accessed by Student"
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
*     /studentservice/studentfeedetails/{adharnumber}:
*       get:
*          description: Get Student Fee Details 
*          tags: [Student Service]
*          summary: Get notification details, Only accessed by Student 
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
*     /studentservice/studentattendance:
*      get:
*          description: Get Student Attendance
*          tags: [Student Service]
*          summary: Get Student Attendance, Accessed by Student 
*          parameters:
*              - in: path
*                name: studentid
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
*/

module.exports = router;