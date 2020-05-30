const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const eventIdParams = Joi.object({
    eventId: Joi.number().required()
})

const eventsObject = Joi.object({
    eventname:Joi.string().required(),
    eventstartdate: Joi.string().required(),
    eventenddate:Joi.string().required(),
    eventdetails:Joi.array().allow("").items(Joi.number().valid(1,2,3,4,5,6,7,8)),
    eventdescription:Joi.string().required(),
    eventtype: Joi.number().required(),
    eventid: Joi.number().allow('')
})

exports.eventsObject = eventsObject;
exports.eventIdParams = eventIdParams;