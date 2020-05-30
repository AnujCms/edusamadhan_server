const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const classIdParams = Joi.object({
    classs: Joi.number().required()
})

const classFeeObject = Joi.object({
    class: Joi.number().required().valid(1,2,3,4,5,6,7,8),
    january: Joi.number().required(),
    february: Joi.number().required(),
    march: Joi.number().required(),
    april: Joi.number().required(),
    may: Joi.number().required(),
    june: Joi.number().required(),
    july: Joi.number().required(),
    august: Joi.number().required(),
    september: Joi.number().required(),
    october: Joi.number().required(),
    november: Joi.number().required(),
    december: Joi.number().required()
})

const adharNumberParams = Joi.object({
    adharnumber: Joi.string().required().max(12).min(12)
})

const adharAndMonthParams = Joi.object({
    adharnumber: Joi.string().required().max(12).min(12),
    selectedmonth: Joi.string().required().valid('january','february','march','april','may','june','july','august','september','october','november','december')
})

const monthFeeObject = Joi.object({
    adharnumber:Joi.string().max(12).min(12).required(),
    selectedmonthfee: Joi.number().required(),
    monthName: Joi.string().required().valid('january','february','march','april','may','june','july','august','september','october','november','december')
})

const classIdAndSectionParams = Joi.object({
    classid: Joi.number().required().valid(1,2,3,4,5,6,7,8),
    sectionid: Joi.number().required().valid(1,2,3,4,5)
})

const transportFeeObject = Joi.object({
    route: Joi.string().required(),
    fee: Joi.number().required(),
    vehiclenumber: Joi.string().required(),
    drivername: Joi.string().required().max(100),
    drivernumber: Joi.string().required(),
    driversalary: Joi.number().required(),
    vehicletype: Joi.number().required().valid(1,2,3,4),
    vehiclecolor: Joi.string().required(),
    vehicleexpense: Joi.number().required()
})

const transportIDParams = Joi.object({
    transportfeeid: Joi.number().required()
})

const expensedetailsidParams = Joi.object({
    expensedetailsid: Joi.number().required()
})

exports.classIdParams = classIdParams;
exports.classFeeObject = classFeeObject;
exports.adharNumberParams = adharNumberParams;
exports.adharAndMonthParams = adharAndMonthParams;
exports.monthFeeObject = monthFeeObject;
exports.classIdAndSectionParams = classIdAndSectionParams;
exports.transportFeeObject = transportFeeObject;
exports.transportIDParams = transportIDParams;
exports.expensedetailsidParams = expensedetailsidParams;