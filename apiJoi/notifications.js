const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const eventIdParams = Joi.object({
    eventId: Joi.number().required()
})

const notificationsObject = Joi.object({
    notificationuser:Joi.number().required(),
    notificationsubject: Joi.string().required(),
    notificationcreateddate:Joi.string().required(),
    notificationdescription:Joi.string().required().max(200),
    notificationid: Joi.number().allow('')
})

exports.notificationsObject = notificationsObject;
exports.eventIdParams = eventIdParams;