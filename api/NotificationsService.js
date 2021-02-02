const router = require('express').Router();
const notificationDB = require("../database/NotificationDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/notifications.js');
const middleWare = require('../apiJoi/middleWare.js');
const encrypt = require('../utils/encrypt');

const isPrincipal = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Teacher) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
const isStudentOrTeacheroraccounttantOrExamHead = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Student || req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.ExamHead || req.user.role === UserEnum.UserRoles.FeeAccount) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
const notificationsObject = middleWare(joiSchema.notificationsObject, "body", true);
const notificationIdParams =  middleWare(joiSchema.notificationIdParams, "params", true);

//save school Notification
router.post("/notificationRegistration", isPrincipal, notificationsObject, async (req, res) => {
    let notificationsObject = {
        accountId: req.user.accountId,
        createdBy:req.user.userId,
        userrole: req.user.role,
        sessionId:JSON.parse(req.user.configData).sessionId,
        notificationUser: req.body.notificationUser,
        notificationSubject: req.body.notificationSubject,
        notificationCreatedDate: req.body.notificationCreatedDate,
        notificationDescription: req.body.notificationDescription
    }
    let result = '';
    if(req.body.notificationId){
        result = await notificationDB.updateSchoolNotification(notificationsObject,req.body.notificationId, JSON.parse(req.user.configData).sessionId);
    }else{
        result = await notificationDB.saveSchoolNotification(notificationsObject);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.notificationId?'Notification has been updated successfully.':'Notification has been created successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Notification not created.' });
    }
});

//get Notification by event id
router.get("/getnotificationtbyid/:notificationId", isPrincipal, notificationIdParams, async (req, res) => {
let notificationData = await notificationDB.getSchoolNotificationsById(req.params.notificationId, req.user.userId, req.user.accountId, JSON.parse(req.user.configData).sessionId);
if(notificationData.length>0){
    res.status(200).json({ status: 1, statusDescription: notificationData });
}else{
    res.status(200).json({ status: 0, statusDescription: 'Not able to get the notifications details' });
}
})

//get school Notifications
router.get("/getschoolnotifications", isPrincipal, async (req, res) => {
    let notificationData = await notificationDB.getSchoolNotifications(req.user.userId, req.user.role, req.user.accountId, JSON.parse(req.user.configData).sessionId);
    if(notificationData.length>0){
        res.status(200).json({ status: 1, statusDescription: notificationData });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the notifications details' });
    }
    })

//get school Notifications for student
router.get("/getschoolnotificationsbyuserrole", async (req, res) => {
    let notificationData = '';
    if(req.user.role === UserEnum.UserRoles.Principal){
        notificationData = await notificationDB.getSchoolNotificationsForPrincipal(req.user.accountId, req.user.userId, req.user.role, JSON.parse(req.user.configData).sessionId);
    }else if(req.user.role === UserEnum.UserRoles.Teacher){
        notificationData = await notificationDB.getSchoolNotificationsForTeacher(req.user.accountId, req.user.userId, req.user.role, JSON.parse(req.user.configData).sessionId);
    }else if(req.user.role === UserEnum.UserRoles.Student){
        notificationData = await notificationDB.getSchoolNotificationsForStudent(req.user.accountId, req.user.userId, req.user.role, JSON.parse(req.user.configData).sessionId);
    }
    else{
        notificationData = await notificationDB.getSchoolNotificationsForUser(req.user.accountId, req.user.role, JSON.parse(req.user.configData).sessionId);
    }
    if(notificationData.length>0){
        res.status(200).json({ status: 1, statusDescription: notificationData });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the notifications details' });
    }
    })
//delete school Notification 
router.delete("/deletenotifications/:notificationId", isPrincipal, notificationIdParams, async (req, res) => {
    let notificationData = await notificationDB.deleteSchoolEvents(req.user.userId, req.user.role, req.user.accountId, req.params.notificationId);
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