const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const eventIdParams = Joi.object({
    eventId: Joi.number().required()
})

const notificationsObject = Joi.object({
    notificationUser:Joi.number().required(),
    notificationSubject: Joi.string().required(),
    notificationCreatedDate:Joi.string().required(),
    notificationDescription:Joi.string().required().max(200),
    notificationId: Joi.number().allow('')
})

exports.notificationsObject = notificationsObject;
exports.eventIdParams = eventIdParams;