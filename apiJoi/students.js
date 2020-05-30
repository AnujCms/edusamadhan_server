const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const adharNumberParams = Joi.object({
    adharnumber: Joi.string().required().max(12).min(12)
})

const profileObject = Joi.object({
    changePassword:Joi.boolean().required(),
    oldPassword: Joi.string().required(),
    newPassword:Joi.string().required(),
    image:Joi.string().required().allow(null)
})

exports.profileObject = profileObject;
exports.adharNumberParams = adharNumberParams;