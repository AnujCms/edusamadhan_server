const router = require('express').Router();
const notificationDB = require("../database/NotificationDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/notifications.js');
const middleWare = require('../apiJoi/middleWare.js');

const isPrincipal = function (req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Teacher) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
const isStudentOrTeacheroraccounttantOrExamHead = function (req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Student || req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.ExamHead || req.user.role === UserEnum.UserRoles.FeeAccount) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
const notificationsObject = middleWare(joiSchema.notificationsObject, "body", true);
const notificationIdParams =  middleWare(joiSchema.notificationIdParams, "params", true);

//save school Notification
router.post("/notificationRegistration", isPrincipal, notificationsObject, async function (req, res) {
    let notificationsObject = {
        accountid: req.user.accountid,
        userid: req.user.userid,
        createdby:req.user.role,
        session:JSON.parse(req.user.configdata).session,
        notificationuser: req.body.notificationuser,
        notificationsubject: req.body.notificationsubject,
        notificationcreateddate: req.body.notificationcreateddate,
        notificationdescription: req.body.notificationdescription
    }
    let result = '';
    if(req.body.notificationid){
        result = await notificationDB.updateSchoolNotification(notificationsObject,req.body.notificationid, JSON.parse(req.user.configdata).session);
    }else{
        result = await notificationDB.saveSchoolNotification(notificationsObject);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.notificationid?'Notification has been updated successfully.':'Notification has been created successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Notification not created.' });
    }
});

//get Notification by event id
router.get("/getnotificationtbyid/:notificationId", isPrincipal, notificationIdParams, async function (req, res) {
let notificationData = await notificationDB.getSchoolNotificationsById(req.params.notificationId, req.user.userid, req.user.accountid, JSON.parse(req.user.configdata).session);
if(notificationData.length>0){
    res.status(200).json({ status: 1, statusDescription: notificationData });
}else{
    res.status(200).json({ status: 0, statusDescription: 'Not able to get the notifications details' });
}
})

//get school Notifications
router.get("/getschoolnotifications", isPrincipal, async function (req, res) {
    let notificationData = await notificationDB.getSchoolNotifications(req.user.userid, req.user.accountid, JSON.parse(req.user.configdata).session);
    if(notificationData.length>0){
        res.status(200).json({ status: 1, statusDescription: notificationData });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the notifications details' });
    }
    })

//get school Notifications for student
router.get("/getschoolnotificationsbyuserrole", isStudentOrTeacheroraccounttantOrExamHead, async function (req, res) {
    let notificationData = '';
    if(req.user.role === 2){
        notificationData = await notificationDB.getSchoolNotificationsForStudents(req.user.accountid, req.user.role, JSON.parse(req.user.configdata).session, req.user.userid);
    }else if(req.user.role === 3){
        notificationData = await notificationDB.getSchoolNotificationsForTeacher(req.user.accountid, req.user.role, JSON.parse(req.user.configdata).session);
    }else{
        notificationData = await notificationDB.getSchoolNotificationsForUser(req.user.accountid, req.user.role, JSON.parse(req.user.configdata).session);
    }
    if(notificationData.length>0){
        res.status(200).json({ status: 1, statusDescription: notificationData });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the notifications details' });
    }
    })
//delete school Notification 
router.delete("/deletenotifications/:notificationId", isPrincipal, notificationIdParams, async function (req, res) {
    let notificationData = await notificationDB.deleteSchoolEvents(req.user.userid, req.user.accountid, req.params.notificationId);
    if(notificationData.affectedRows){
        res.status(200).json({ status: 1, statusDescription: "Selected notification has been deleted successfully" });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to delete notification.' });
    }
    })

/**
* @swagger
* paths:
*     /notificationservice/notificationRegistration:
*         post:
*             description: Create Notification
*             tags: [Notification Service]
*             summary: "Create Notification, only accessed by Principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 notificationuser:
*                                     type: number
*                                 notificationsubject:
*                                     type: string
*                                 notificationcreateddate:
*                                     type: string
*                                 notificationdescription:
*                                     type: string
*                                 notificationid:
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
*     /notificationservice/getnotificationtbyid/{notificationId}:
*       get:
*          description: Get notification details 
*          tags: [Notification Service]
*          summary: Get notification details, Only accessed by Principal 
*          parameters:
*              - in: path
*                name: notificationId
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
*     /notificationservice/getschoolnotifications:
*      get:
*          description: Get All the notification
*          tags: [Notification Service]
*          summary: Get All the notification, Only accessed by Principal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /notificationservice/getschoolnotificationsbyuserrole:
*      get:
*          description: Get All the notification
*          tags: [Notification Service]
*          summary: Get All the notification, Accessed by users 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /notificationservice/deletenotifications/{notificationId}:
*       delete:
*          description: Delete Events by notificationId 
*          tags: [Notification Service]
*          summary: Delete Events by notificationId, Only accessed by Principal 
*          parameters:
*              - in: path
*                name: notificationId
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