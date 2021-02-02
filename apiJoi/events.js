const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const eventIdParams = Joi.object({
    eventId: Joi.number().required()
})

const eventsObject = Joi.object({
    eventName:Joi.string().required(),
    eventStartdate: Joi.string().required(),
    eventEnddate:Joi.string().required(),
    eventDetails:Joi.array().allow("").items(Joi.number().valid(1,2,3,4,5,6,7,8)),
    eventDescription:Joi.string().required(),
    eventType: Joi.number().required(),
    eventId: Joi.number().allow('')
})

exports.eventsObject = eventsObject;
exports.eventIdParams = eventIdParams;