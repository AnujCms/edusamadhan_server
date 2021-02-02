const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));

const userMessage = Joi.object({
    messageUser: Joi.number().valid(2,3,4).required(),
    userMessage:Joi.string().required().min(5).max(2000),
    images:Joi.string().allow('').allow(null),
    msgId:Joi.number().allow('').allow(null)
})
exports.userMessage = userMessage;