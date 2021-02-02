const router = require('express').Router();
const eventsDB = require("../database/EventsDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/events.js');
const middleWare = require('../apiJoi/middleWare.js');

const isPrincipal = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Principal) {
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

const eventsObject = middleWare(joiSchema.eventsObject, "body", true);
const eventIdParams =  middleWare(joiSchema.eventIdParams, "params", true);

//create and update school event
router.post("/eventRegistration", isPrincipal, eventsObject, async (req, res) => {
    let eventData = {
        data: JSON.stringify([{ eventStartdate: req.body.eventStartdate, eventEnddate: req.body.eventEnddate, eventDetails: req.body.eventDetails, eventDescription:req.body.eventDescription }])
    }
    let eventsObjects = {
        eventName: req.body.eventName,
        accountId: req.user.accountId,
        userId: req.user.userId,
        eventData: eventData.data,
        eventType: req.body.eventType,
        sessionId:JSON.parse(req.user.configData).sessionId
    }
    let result = ''
    if(req.body.eventId){
        eventsObjects.eventId = req.body.eventId
        result = await eventsDB.updateSchoolEvent(eventsObjects);
    }else{
        result = await eventsDB.saveSchoolEvent(eventsObjects)
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.eventId?"Event has been updated successfully.":'Event has been created successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Event not created.' });
    }
});

//get events by event id
router.get("/geteventbyid/:eventId", isPrincipal, eventIdParams, async (req, res)=> {
let eventData = await eventsDB.getSchoolEventsById(req.params.eventId, req.user.accountId, req.user.userId, JSON.parse(req.user.configData).sessionId);
if(eventData.length>0){
    res.status(200).json({ status: 1, statusDescription: eventData });
}else{
    res.status(200).json({ status: 0, statusDescription: 'Not able to get the events details' });
}
})

//get school events
router.get("/getschoolevents", async (req, res) => {
    let eventData = await eventsDB.getSchoolEvents(req.user.accountId, JSON.parse(req.user.configData).sessionId);
    if(eventData.length>0){
        res.status(200).json({ status: 1, statusDescription: eventData });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the events details' });
    }
    })

//get school events for student
router.get("/getschooleventsforstudent", isStudentOrTeacheroraccounttantOrExamHead, async (req, res) => {
    let eventData = await eventsDB.getSchoolEventsForStudent(req.user.accountId);
    if(eventData.length>0){
        res.status(200).json({ status: 1, statusDescription: eventData });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the events details' });
    }
    })
//delete school events 
router.delete("/deleteevents/:eventId", isPrincipal, eventIdParams, async (req, res) => {
    let eventData = await eventsDB.deleteSchoolEvents(req.user.userId, req.user.accountId, req.params.eventId, JSON.parse(req.user.configData).sessionId);
    if(eventData.affectedRows){
        res.status(200).json({ status: 1, statusDescription: "Selected event has been deleted successfully" });
    }else{
        res.status(200).json({ status: 0, statusDescription: 'Not able to delete event.' });
    }
    })

/**
* @swagger
* paths:
*     /eventsservice/eventRegistration:
*         post:
*             description: Create Events
*             tags: [Events Service]
*             summary: "Create Events, only accessed by Principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 eventName:
*                                     type: string
*                                 eventStartdate:
*                                     type: string
*                                 eventEnddate:
*                                     type: string
*                                 eventDetails:
*                                     type: array
*                                 eventDescription:
*                                     type: string
*                                 eventtype:
*                                     type: number
*                                 eventId:
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
*     /eventsservice/geteventbyid/{eventId}:
*       get:
*          description: Get event details 
*          tags: [Events Service]
*          summary: Get event details, Only accessed by Principal 
*          parameters:
*              - in: path
*                name: eventId
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
*     /eventsservice/getschoolevents:
*      get:
*          description: Get All the events
*          tags: [Events Service]
*          summary: Get All the events, Only accessed by Principal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /eventsservice/getschooleventsforstudent:
*      get:
*          description: Get All the events
*          tags: [Events Service]
*          summary: Get All the events, Only accessed by Principal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /eventsservice/deleteevents/{eventId}:
*       delete:
*          description: Delete Events by EventId 
*          tags: [Events Service]
*          summary: Delete Events by EventId, Only accessed by Principal 
*          parameters:
*              - in: path
*                name: eventId
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