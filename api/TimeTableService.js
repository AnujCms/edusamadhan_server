const router = require('express').Router();
const TimeTableDB = require("../database/TimeTableDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/timetable.js');
const middleWare = require('../apiJoi/middleWare.js');
const encrypt = require('../utils/encrypt');

const isPrincipal = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Principal) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
const isPrincipalOrTeacherOrStudent = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.Student || req.user.role === UserEnum.UserRoles.FeeAccount || req.user.role === UserEnum.UserRoles.ExamHead) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}

const classIdParams =  middleWare(joiSchema.classIdParams, "params", true);
const subjectIdParams =  middleWare(joiSchema.subjectIdParams, "params", true);
const periodObject = middleWare(joiSchema.periodObject, "body", true);
const timeTableObject = middleWare(joiSchema.timeTableObject, "body", true);
const classAndSectionParams =  middleWare(joiSchema.classAndSectionParams, "params", true);

//get subjects of selected class
router.get("/getsubjectofselectedclass/:classId", isPrincipal, classIdParams, async (req, res) => {
    let results = await TimeTableDB.getSubjectsOfSelectedClass(req.params.classId, req.user.userId, req.user.accountId);
    if(results.length>0){
        res.status(200).json({status:1, statusDescription:JSON.parse(results[0].subjects)});
    }else{
        res.status(200).json({status:0, statusDescription:"Not able to get subjects."});
    }
})
//get teachers of selected subjects
router.get("/getsubjectteachers/:subjectId", isPrincipal, subjectIdParams, async (req, res) =>{
    let results = await TimeTableDB.getTeachersOfSelectedSubject(req.params.subjectId, UserEnum.UserRoles.Teacher, req.user.accountId, req.user.userId);
    if(results.length>0){
        let teacherArray = []
        results.map((item)=>{
            let teacherObj = {
                firstName: encrypt.decrypt(item.firstName),
                lastName: encrypt.decrypt(item.lastName),
                userId: item.userId
            }
            teacherArray.push(teacherObj);
        })
        res.status(200).json({status:1, statusDescription:teacherArray});
    }else{
        res.status(200).json({status:0, statusDescription:"Not able to get teacher."});
    }
})
//create periods
router.post("/createperiods", isPrincipal, periodObject, async (req, res) => {
    let periodObject;
    switch (req.body.periodId) {
        case 1: periodObject = { period1: JSON.stringify([{periodId:req.body.periodId, periodStartTime:req.body.periodStartTime , periodEndTime: req.body.periodEndTime}])}
            break;
        case 2: periodObject = { period2: JSON.stringify([{periodId:req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime }])};
            break;
        case 3: periodObject = { period3: JSON.stringify([{periodId:req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime }])};
            break;
        case 4: periodObject = { period4:JSON.stringify([{periodId: req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime }])};
            break;
        case 5: periodObject = { period5:JSON.stringify([{periodId: req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime}]) };
            break;
        case 6: periodObject = { period6:JSON.stringify([{periodId: req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime}]) };
            break;
        case 7: periodObject = { period7:JSON.stringify([{periodId: req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime}]) };
            break;
        case 8: periodObject = { period8:JSON.stringify([{periodId: req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime}]) };
            break;
        case 9: periodObject = { period9:JSON.stringify([{periodId: req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime}]) };
            break;
        case 10: periodObject = { period10:JSON.stringify([{periodId: req.body.periodId, periodStartTime: req.body.periodStartTime, periodEndTime: req.body.periodEndTime}]) };
            break;
        default:
            break;
    }
    periodObject.userId = req.user.userId;
    periodObject.accountId = req.user.accountId;
    periodObject.sessionId = JSON.parse(req.user.configData).sessionId;

    let results = await TimeTableDB.createPeriods(periodObject);
    if(results){
        res.status(200).json({status:1, statusDescription:"Period has been submitted successfully."});
    }else{
        res.status(200).json({status:0, statusDescription:"Not able to save period details."});
    }
})
//get periods details
router.get("/getperiodsdetails", async (req, res) => {
    let results = await TimeTableDB.getPeriodsDetails(req.user.accountId, JSON.parse(req.user.configData).sessionId);
    if(results.length>0){
        res.status(200).json({status:1, statusDescription:results});
    }else{
        res.status(200).json({status:0, statusDescription:"Not able to get teacher."});
    }
})
//create timeTAble
router.post("/savetimetable", isPrincipal, timeTableObject, async (req, res) => {
    let timeTableObject;
    switch (req.body.periodId) {
        case 1: timeTableObject = { period1: JSON.stringify([{periodId:req.body.periodId, dayName:req.body.dayName , subjectName: req.body.subjectName, teacherName: req.body.teacherName}])}
            break;
        case 2: timeTableObject = { period2: JSON.stringify([{periodId:req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName }])};
            break;
        case 3: timeTableObject = { period3: JSON.stringify([{periodId:req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName}])};
            break;
        case 4: timeTableObject = { period4:JSON.stringify([{periodId: req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName }])};
            break;
        case 5: timeTableObject = { period5:JSON.stringify([{periodId: req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName}]) };
            break;
        case 6: timeTableObject = { period6:JSON.stringify([{periodId: req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName}]) };
            break;
        case 7: timeTableObject = { period7:JSON.stringify([{periodId: req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName}]) };
            break;
        case 8: timeTableObject = { period8:JSON.stringify([{periodId: req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName}]) };
            break;
        case 9: timeTableObject = { period9:JSON.stringify([{periodId: req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName}]) };
            break;
        case 10: timeTableObject = { period10:JSON.stringify([{periodId: req.body.periodId, dayName: req.body.dayName, subjectName: req.body.subjectName, teacherName: req.body.teacherName}]) };
            break;
        default:
            break;
    }
    timeTableObject.accountId = req.user.accountId;
    timeTableObject.userId = req.user.userId;
    timeTableObject.classId = req.body.classId;
    timeTableObject.sectionId = req.body.sectionId;
    timeTableObject.dayname = req.body.dayname;
    timeTableObject.sessionId = JSON.parse(req.user.configData).sessionId;

    let results = await TimeTableDB.createTimeTable(timeTableObject);
    if(results){
        res.status(200).json({status:1, statusDescription:"TimeTable has been submitted successfully."});
    }else{
        res.status(200).json({status:0, statusDescription:"Not able to save period details."});
    }
})
//get full timetable by principal
router.get("/getfulltimetable/:classId/:sectionId", isPrincipalOrTeacherOrStudent, classAndSectionParams, async (req, res) => {
    let results = await TimeTableDB.getFullTimeTable(req.user.accountId, JSON.parse(req.user.configData).sessionId, req.params.classId, req.params.sectionId);
    if(results.length>0){
        res.status(200).json({status:1, statusDescription:results});
    }else{
        res.status(200).json({status:0, statusDescription:"Not able to get time table data."});
    }
})

/**
* @swagger
* paths:
*     /timetableservice/getsubjectofselectedclass/{classId}:
*       get:
*          description: Get subjects of selected class 
*          tags: [TimeTable Service]
*          summary: Get subjects of selected class, Only accessed by Principal 
*          parameters:
*              - in: path
*                name: classid
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
*     /timetableservice/getsubjectteachers/{subjectId}:
*      get:
*          description: Get Subject Teachers
*          tags: [TimeTable Service]
*          summary: Get Subject Teachers, Only accessed by Principal 
*          parameters:
*              - in: path
*                name: subjectid
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
*     /timetableservice/createperiods:
*         post:
*             description: Create Periods 
*             tags: [TimeTable Service]
*             summary: "Create Periods, only accessed by Principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 periodId:
*                                     type: number
*                                 periodStartTime:
*                                     type: string
*                                 periodEndTime:
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
*     /timetableservice/getperiodsdetails:
*       get:
*          description: Get Periods Details
*          tags: [TimeTable Service]
*          summary: Get Periods Details, Only accessed by Principal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /timetableservice/savetimetable:
*         post:
*             description: Create Time Table
*             tags: [TimeTable Service]
*             summary: "Create Time Table, only accessed by Principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 periodId:
*                                     type: number
*                                 dayName:
*                                     type: number
*                                 subjectName:
*                                     type: number
*                                 teacherName:
*                                     type: string
*                                 class:
*                                     type: number
*                                 section:
*                                     type: number
*                                 dayname:
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
*     /timetableservice/getfulltimetable/{classId}/{sectionId}:
*      get:
*          description: Get Subject Teachers
*          tags: [TimeTable Service]
*          summary: Get Subject Teachers, Only accessed by Principal 
*          parameters:
*              - in: path
*                name: classid
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionid
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