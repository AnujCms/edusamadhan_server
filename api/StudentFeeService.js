const router = require('express').Router();
const studentFeeDB = require("../database/StudentFeeDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/accountant.js');
const middleWare = require('../apiJoi/middleWare.js');

function isAccountantOrTeacher(req, res, next) {
    if (req.user.role == UserEnum.UserRoles.FeeAccount || req.user.role === UserEnum.UserRoles.Teacher) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isTeacher(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Teacher) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isAccountant(req, res, next) {
    if (req.user.role == UserEnum.UserRoles.FeeAccount ) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}

async function isStudentBelongsToSameSchool(req, res, next) {
    let result = await studentFeeDB.checkStudentSchool(req.user.accountid,  (req.params.adharnumber || req.body.adharnumber))
    if (result === 1) {
        next();
    } else if(result === 2) {
        return res.status(200).json({ status: 2, statusDescription: "AAdhar number is not belongs to your school. Try with correct aadhar number." });
    }else if(result === 3){
        return res.status(200).json({ status: 2, statusDescription: "AAdhar number is not registered in my system. Try with correct aadhar number." });
    }
}

async function isClassBelongsToSameSchool(req, res, next) {
    let result = await studentFeeDB.checkClassSchool(req.user.accountid, req.params.classid, req.params.sectionid, UserEnum.UserRoles.Teacher, JSON.parse(req.user.configdata).session)
   console.log('result',result)
    if (result) {
        next();
    } else {
        return res.status(200).json({ status: 2, statusDescription: "AAdhar number is not belongs to your school. Try with correct aadhar number." });
    }
}

const classIdParams =  middleWare(joiSchema.classIdParams, "params", true);
const classFeeObject = middleWare(joiSchema.classFeeObject, "body", true);
const adharNumberParams =  middleWare(joiSchema.adharNumberParams, "params", true);
const adharAndMonthParams =  middleWare(joiSchema.adharAndMonthParams, "params", true);
const monthFeeObject =  middleWare(joiSchema.monthFeeObject, "body", true);
const classIdAndSectionParams =  middleWare(joiSchema.classIdAndSectionParams, "params", true);
const transportFeeObject =  middleWare(joiSchema.transportFeeObject, "body", true);
const transportIDParams =  middleWare(joiSchema.transportIDParams, "params", true);
const expensedetailsidParams =  middleWare(joiSchema.expensedetailsidParams, "params", true);

//get fee details
router.get("/getfeedetails", isAccountantOrTeacher, async function (req, res) {
    let result = await studentFeeDB.getFeeDetails(JSON.parse(req.user.configdata).session, req.user.accountid);
    if (result.length > 0) {
        var resultObj = []
        result.forEach(function (row) {
            resultObj.push({
                class: row.class,
                january: row.january,
                february: row.february,
                march: row.march,
                april: row.april,
                may: row.may,
                june: row.june,
                july: row.july,
                august: row.august,
                september: row.september,
                october: row.october,
                november: row.november,
                december: row.december
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get fee details.' });
    }
})
//get fee details by class
router.get("/getfeedetailbyclass/:classs", isAccountantOrTeacher, classIdParams, async function (req, res) {
    let result = await studentFeeDB.getFeeDetailByClass(JSON.parse(req.user.configdata).session, req.user.accountid, req.params.classs);
    if (result.length > 0) {
        var resultObj = []
        result.forEach(function (row) {
            resultObj.push({
                class: row.class,
                january: row.january,
                february: row.february,
                march: row.march,
                april: row.april,
                may: row.may,
                june: row.june,
                july: row.july,
                august: row.august,
                september: row.september,
                october: row.october,
                november: row.november,
                december: row.december
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get fee details.' });
    }
})
//create fee for selected class
router.post("/createfeeforselectedclass", isAccountant, classFeeObject, async function (req, res) {
    feeObject = {
        class: req.body.class,
        january: req.body.january,
        february: req.body.february,
        march: req.body.march,
        april: req.body.april,
        may: req.body.may,
        june: req.body.june,
        july: req.body.july,
        august: req.body.august,
        september: req.body.september,
        october: req.body.october,
        november: req.body.november,
        december: req.body.december
    }
    let result = await studentFeeDB.manageFee(JSON.parse(req.user.configdata).session, req.user.accountid, feeObject);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Fee details has been saved successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to create fee details.' });
    }
})
//update Student fee details
router.put("/updatefeedetails", isAccountant, classFeeObject, async function (req, res) {
    feeObject = {
        class: req.body.class,
        january: req.body.january,
        february: req.body.february,
        march: req.body.march,
        april: req.body.april,
        may: req.body.may,
        june: req.body.june,
        july: req.body.july,
        august: req.body.august,
        september: req.body.september,
        october: req.body.october,
        november: req.body.november,
        december: req.body.december
    }
    let result = await studentFeeDB.updateFeeDetails(JSON.parse(req.user.configdata).session, req.user.accountid, feeObject);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Fee details has been updated successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to update fee details.' });
    }
})
//get Student fee details
router.get("/feedetails/:adharnumber", isAccountant, adharNumberParams, isStudentBelongsToSameSchool, async function (req, res) {
    let result = await studentFeeDB.getStudentFeeDetails(req.params.adharnumber, JSON.parse(req.user.configdata).session, req.user.accountid, UserEnum.UserRoles.Student);
    if (result.student.length > 0) {
        var s = result.student[0];
        var f = result.feeDetails[0];
        var str = result.feeStructure[0];

        var studentfeeData = {
            name: encrypt.decrypt(s.firstname) + " " + encrypt.decrypt(s.lastname),
            mothername: s.mothername,
            fathername: s.fathername,
            dob: encrypt.decrypt(s.dob),
            cellnumber: encrypt.decrypt(s.cellnumber),
            gender: s.gender,
            adharnumber: s.adharnumber,
            busservice: s.busservice
        }
        if (result.feeStructure.length > 0) {
            var studentFeeStructure = {
                jan: str.january,
                feb: str.february,
                mar: str.march,
                apr: str.april,
                may: str.may,
                jun: str.june,
                jul: str.july,
                aug: str.august,
                sep: str.september,
                oct: str.october,
                nov: str.november,
                dec: str.december
            }
        }
        if (result.feeDetails.length > 0) {
            var studentFeeDetails = {
                jan: f.january,
                feb: f.february,
                mar: f.march,
                apr: f.april,
                may: f.may,
                jun: f.june,
                jul: f.july,
                aug: f.august,
                sep: f.september,
                oct: f.october,
                nov: f.november,
                dec: f.december
            }
        } else {
            studentFeeDetails = {}
        }
        res.status(200).json({ status: 1, studentfeeData: studentfeeData, studentFeeDetails: studentFeeDetails, studentFeeStructure: studentFeeStructure });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get fee details." });
    }
})
//get monthly fee based on selected month
router.get("/getmonthlyfee/:adharnumber/:selectedmonth", isAccountant, adharAndMonthParams, isStudentBelongsToSameSchool, async function (req, res) {
    let result = await studentFeeDB.getMonthlyFeeBasedOnSelectedMonth(req.params.adharnumber, JSON.parse(req.user.configdata).session, req.user.accountid, req.params.selectedmonth);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get month." });
    }
})
//pay student fee
router.post("/paystudentfee", isAccountant, monthFeeObject, isStudentBelongsToSameSchool, async function (req, res) {
    let studentFeeObj = {
        monthName: req.body.monthName,
        selectedmonthfee: req.body.selectedmonthfee
    }
    let result = await studentFeeDB.payStudentFee(req.body.adharnumber, JSON.parse(req.user.configdata).session, studentFeeObj);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Student fee has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to submit the fee." });
    }
})

//get fee details by class
router.get("/getclassfeedetails/:classid/:sectionid", isTeacher, classIdAndSectionParams, async function (req, res) {
    let result = await studentFeeDB.getclassfeedetails(JSON.parse(req.user.configdata).session, req.user.accountid, req.params.classid, req.params.sectionid);
    if (result.feeDetails.length > 0) {
        let resultObj = [];
        let fee = result.feeStructure[0];
        let totalFee = fee.january + fee.february + fee.march + fee.april + fee.may + fee.june + fee.july + fee.august + fee.september + fee.october + fee.november + fee.december;
        result.feeDetails.forEach(function (row) {
            let totalPaidFee = row.january + row.february + row.march + row.april + row.may + row.june + row.july + row.august + row.september + row.october + row.november + row.december;
            resultObj.push({
                name: encrypt.decrypt(row.firstname) + " " + encrypt.decrypt(row.lastname),
                adharnumber: row.adharnumber,
                january: row.january,
                february: row.february,
                march: row.march,
                april: row.april,
                may: row.may,
                june: row.june,
                july: row.july,
                august: row.august,
                september: row.september,
                october: row.october,
                november: row.november,
                december: row.december,
                totalFee: totalFee,
                paidfee: totalPaidFee,
                remainingfee: totalFee - totalPaidFee
            })
        })
        res.status(200).json({ status: 1, studentFeeDetails: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get fee details.' });
    }
})

//get student fee print details
router.get("/getfeeprintdetails/:adharnumber", isAccountantOrTeacher, adharNumberParams, isStudentBelongsToSameSchool, async function (req, res) {
    let result = await studentFeeDB.getFeeDetailsForPrint(req.params.adharnumber, JSON.parse(req.user.configdata).session, req.user.accountid);
    if (result.studentData.length > 0) {
        let freePrintData = {
            schoolName: result.school[0].accountname,
            schoolNumber: result.school[0].accountrefnumber,
            schoolAddress: result.school[0].accountaddress,
            studentName: encrypt.decrypt(result.studentData[0].firstname) + " " + encrypt.decrypt(result.studentData[0].lastname),
            adharNumber: result.studentData[0].adharnumber,
            cellNumber: encrypt.decrypt(result.studentData[0].cellnumber),
            dob: encrypt.decrypt(result.studentData[0].dob),
            motherName: result.studentData[0].mothername,
            fatherName: result.studentData[0].fathername,
            class: result.studentData[0].classid,
            section: result.studentData[0].section
        }
        res.status(200).json({ status: 1, statusDescription: freePrintData });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able tpoo get the data." });
    }
})

//get Full Class Fee Details of class
router.get("/getstudentslist/:classid/:sectionid", classIdAndSectionParams, async function (req, res) {
    let result = await studentFeeDB.getStudentsListOfClass(req.user.accountid, req.user.userid, req.params.classid, req.params.sectionid, JSON.parse(req.user.configdata).session);
    if (result.length > 0) {
        var resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                userid: row.userid,
                firstname: encrypt.decrypt(row.firstname),
                lastname: encrypt.decrypt(row.lastname),
                mothername: row.mothername,
                fathername: row.fathername,
                cellnumber: encrypt.decrypt(row.cellnumber),
                roll: row.rollnumber,
                adharnumber: row.adharnumber,
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                status: row.status,
                images:row.images,
                classid: row.classid,
                section: row.section,
                busservice: row.busservice
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the students.' });
    }
})

//get Student fee details 
router.get("/getfullfeedetails/:classid/:sectionid", classIdAndSectionParams, async function (req, res) {
    let result = await studentFeeDB.getFullFeeDetails(req.user.accountid, req.params.classid, req.params.sectionid, JSON.parse(req.user.configdata).session);
    if (result) {
        var resultObj = [];
        var a = result.feeStructure[0];
        setRoute = (value) =>{
            let fee
            result.transport.map((item)=>{
                if(value == item.transportfeeid){
                    fee = item.fee
                }
            })
            return fee;
        }
        var feeSum = parseInt(a.january) + a.february + a.march + a.april + a.may + a.june + a.july + a.august + a.september + a.october + a.november + a.december;
        result.submittedfee.forEach(function (row, index) {
            resultObj.push({
                studentid: row.studentid,
                adharnumber: row.adharnumber,
                january: row.january,
                february: row.february,
                march: row.march,
                april: row.april,
                may: row.may,
                june: row.june,
                july: row.july,
                august: row.august,
                september: row.september,
                october: row.october,
                november: row.november,
                december: row.december,
                submittedSum: row.january + row.february + row.march + row.april + row.may + row.june + row.july + row.august + row.september + row.october + row.november + row.december,
                totalFee: feeSum,
                name: encrypt.decrypt(result.student[index].firstname) + " " + encrypt.decrypt(result.student[index].lastname),
                images: result.student[index].images,
                busservice: result.student[index].busservice,
                transport: result.student[index].busservice == 2&& setRoute(result.student[index].route)
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee details." });
    }
})

//create transport fee
router.post("/createtransportfee", isAccountant, transportFeeObject, async function (req, res) {
    let transportFeeObj = {
        accountid: req.user.accountid,
        userid: req.user.userid,
        route: encrypt.encrypt(req.body.route),
        fee: req.body.fee,
        vehiclenumber: encrypt.encrypt(req.body.vehiclenumber),
        drivername: encrypt.encrypt(req.body.drivername),
        drivernumber: encrypt.encrypt(req.body.drivernumber),
        driversalary: req.body.driversalary,
        vehicletype: req.body.vehicletype,
        vehiclecolor: req.body.vehiclecolor,
        vehicleexpense: req.body.vehicleexpense,
        session: JSON.parse(req.user.configdata).session
    }
    let result = await studentFeeDB.createTranssportFee(transportFeeObj);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Transport Fee has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to submit the fee." });
    }
})

//get transport fee
router.get("/gettransportfee", isAccountantOrTeacher, async function (req, res) {
    let result = await studentFeeDB.getTranssportFee(req.user.accountid, JSON.parse(req.user.configdata).session);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                route: encrypt.decrypt(row.route),
                fee: row.fee,
                transportfeeid: row.transportfeeid,
                vehiclenumber: encrypt.decrypt(row.vehiclenumber),
                drivername: encrypt.decrypt(row.drivername),
                drivernumber: encrypt.decrypt(row.drivernumber),
                driversalary: row.driversalary,
                vehicletype: row.vehicletype,
                vehiclecolor: row.vehiclecolor,
                vehicleexpense: row.vehicleexpense
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

//delete transport fee
router.delete("/deletetransportfee/:transportfeeid", isAccountant, transportIDParams, async function (req, res) {
    let result = await studentFeeDB.deleteTranssportFee(req.user.accountid, JSON.parse(req.user.configdata).session, req.user.userid, req.params.transportfeeid);
    if (result === 1) {
        res.status(200).json({ status: 1, statusDescription: "Transport fee has been deleted successfully."});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the fee." });
    }
})

//get transport fee
router.get("/gettetransportfee/:transportfeeid", isAccountantOrTeacher, transportIDParams, async function (req, res) {
    let result = await studentFeeDB.getTranssportFeeById(req.user.accountid, JSON.parse(req.user.configdata).session, req.user.userid, req.params.transportfeeid);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                route: encrypt.decrypt(row.route),
                fee: row.fee,
                transportfeeid: row.transportfeeid,
                vehiclenumber: encrypt.decrypt(row.vehiclenumber),
                drivername: encrypt.decrypt(row.drivername),
                drivernumber: encrypt.decrypt(row.drivernumber),
                driversalary: row.driversalary,
                vehicletype: row.vehicletype,
                vehiclecolor: row.vehiclecolor,
                vehicleexpense: row.vehicleexpense
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the fee." });
    }
})

//update transport fee
router.put("/updatetransportfee/:transportfeeid", isAccountant, async function (req, res) {
    let feeObj = {
        route: encrypt.encrypt(req.body.route),
        fee: req.body.fee,
        vehiclenumber: encrypt.encrypt(req.body.vehiclenumber),
        drivername: encrypt.encrypt(req.body.drivername),
        drivernumber: encrypt.encrypt(req.body.drivernumber),
        driversalary: req.body.driversalary,
        vehicletype: req.body.vehicletype,
        vehiclecolor: req.body.vehiclecolor,
        vehicleexpense: req.body.vehicleexpense,
        session: JSON.parse(req.user.configdata).session
    }
    let result = await studentFeeDB.updateTranssportFeeById(feeObj, req.user.accountid, JSON.parse(req.user.configdata).session, req.user.userid, req.params.transportfeeid);
    if (result === 1) {
        res.status(200).json({ status: 1, statusDescription: "Transport fee has been updated successfully."});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to update the fee." });
    }
})

//create expense
router.post("/createexpense", isAccountant, async function (req, res) {
    let transportFeeObj = {
        accountid: req.user.accountid,
        userid: req.user.userid,
        expense: req.body.expense,
        expenseamount: req.body.expenseamount,
        expensedate: req.body.expensedate,
        session: JSON.parse(req.user.configdata).session
    }
    let result = await studentFeeDB.createExpense(transportFeeObj);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Expense has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to submit the expense." });
    }
})

//get expense
router.get("/getexpense", isAccountantOrTeacher, async function (req, res) {
    let result = await studentFeeDB.getExpense(req.user.accountid, JSON.parse(req.user.configdata).session);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                expensedetailsid: row.expensedetailsid,
                expense: row.expense,
                expenseamount: row.expenseamount,
                expensedate: row.expensedate
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

//delete expense
router.delete("/deleteexpense/:expensedetailsid", isAccountant, expensedetailsidParams, async function (req, res) {
    let result = await studentFeeDB.deleteExpense(req.user.accountid, JSON.parse(req.user.configdata).session, req.user.userid, req.params.expensedetailsid);
    if (result === 1) {
        res.status(200).json({ status: 1, statusDescription: "Expense has been deleted successfully."});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the expense." });
    }
})

//get transport fee
router.get("/getentrance/:expensedetailsid", isAccountantOrTeacher, expensedetailsidParams, async function (req, res) {
    let result = await studentFeeDB.getExpenxeById(req.user.accountid, JSON.parse(req.user.configdata).session, req.user.userid, req.params.expensedetailsid);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                expensedetailsid: row.expensedetailsid,
                expense: row.expense,
                expenseamount: row.expenseamount,
                expensedate: row.expensedate
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the expense." });
    }
})

//update Expense
router.put("/expense/:expensedetailsid", isAccountant, async function (req, res) {
    let feeObj = {
        accountid: req.user.accountid,
        userid: req.user.userid,
        expense: req.body.expense,
        expenseamount: req.body.expenseamount,
        expensedate: req.body.expensedate,
        session: JSON.parse(req.user.configdata).session
    }
    let result = await studentFeeDB.updateExpenseById(feeObj, req.user.accountid, JSON.parse(req.user.configdata).session, req.user.userid, req.params.expensedetailsid);
    if (result === 1) {
        res.status(200).json({ status: 1, statusDescription: "Expense has been updated successfully."});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to update the expense." });
    }
})

//get expense
router.get("/getstaffsalary", isAccountantOrTeacher, async function (req, res) {
    let result = await studentFeeDB.getStaffSalary(req.user.accountid, JSON.parse(req.user.configdata).session);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                firstname: row.firstname,
                lastname: row.lastname,
                cellnumber: encrypt.decrypt(row.cellnumber),
                emailid:encrypt.decrypt(row.emailid),
                adharnumber: row.adharnumber,
                salary: row.salary,
                gender: row.gender,
                userrole: row.userrole
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

//get transport fee
router.get("/getstudenttransportfee/:adharnumber", async function (req, res) {
    let result = await studentFeeDB.getTransportFee(req.user.accountid, req.params.adharnumber, JSON.parse(req.user.configdata).session);
    if (result.length) {
        res.status(200).json({ status: 1, statusDescription: result});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

/**
* @swagger
* paths:
*     /studentfeeservice/getfeedetails:
*      get:
*          description: Get Fee Details, only access by Accountant 
*          tags: [Accountant Service]
*          summary: Get Fee Details, only access by Accountant 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   class: ''
*                                   january: ''
*                                   february: ''
*                                   march: ''
*                                   april: ''
*                                   may: ''
*                                   june: ''
*                                   july: ''
*                                   august: ''
*                                   september: ''
*                                   october: ''
*                                   november: ''
*                                   december: ''
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getfeedetailbyclass/{classs}:
*       get:
*          description: Get Class Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Class Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classs
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
*                                example:
*                                   class: ''
*                                   january: ''
*                                   february: ''
*                                   march: ''
*                                   april: ''
*                                   may: ''
*                                   june: ''
*                                   july: ''
*                                   august: ''
*                                   september: ''
*                                   october: ''
*                                   november: ''
*                                   december: ''
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/createfeeforselectedclass:
*         post:
*             description: Save Fee Details 
*             tags: [Accountant Service]
*             summary: "Save Fee Details of a class, only accessed by Accountant"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 class:
*                                     type: number
*                                 january:
*                                     type: number
*                                 february:
*                                     type: number
*                                 march:
*                                     type: number
*                                 april:
*                                     type: number
*                                 may:
*                                     type: number
*                                 june:
*                                     type: number
*                                 july:
*                                     type: number
*                                 august:
*                                     type: number
*                                 september:
*                                     type: number
*                                 october:
*                                     type: number
*                                 november:
*                                     type: number
*                                 december:
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
*     /studentfeeservice/updatefeedetails:
*         put:
*             description: Update Fee Details 
*             tags: [Accountant Service]
*             summary: "Update Fee Details of a class, only accessed by Accountant"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 class:
*                                     type: number
*                                 january:
*                                     type: number
*                                 february:
*                                     type: number
*                                 march:
*                                     type: number
*                                 april:
*                                     type: number
*                                 may:
*                                     type: number
*                                 june:
*                                     type: number
*                                 july:
*                                     type: number
*                                 august:
*                                     type: number
*                                 september:
*                                     type: number
*                                 october:
*                                     type: number
*                                 november:
*                                     type: number
*                                 december:
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
*     /studentfeeservice/feedetails/{adharnumber}:
*       get:
*          description: Get Student Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Fee Details by AAdhar Number, only access by Accountant  
*          parameters:
*              - in: path
*                name: adharnumber
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getmonthlyfee/{adharnumber}/{selectedmonth}:
*       get:
*          description: Get Student Monthly Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Monthly Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: adharnumber
*                required: true
*                schema:
*                  type: string
*              - in: path
*                name: selectedmonth
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/paystudentfee:
*         post:
*             description: Pay Student Fee
*             tags: [Accountant Service]
*             summary: Pay student fee, only accessed by Accountant
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 adharnumber:
*                                     type: string
*                                 selectedmonthfee:
*                                     type: number
*                                 monthName:
*                                     type: string
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /studentfeeservice/getclassfeedetails/{classid}/{sectionid}:
*       get:
*          description: Get Class Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Class Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classid
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionid
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
*     /studentfeeservice/getfeeprintdetails/{adharnumber}:
*       get:
*          description: Get Student Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: adharnumber
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
*     /studentfeeservice/getstudentslist/{classid}/{sectionid}:
*       get:
*          description: Get Students List, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classid
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionid
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
*     /studentfeeservice/getfullfeedetails/{classid}/{sectionid}:
*       get:
*          description: Get Full Class Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Full Class Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classid
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionid
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
*     /studentfeeservice/createtransportfee:
*         post:
*             description: Create Transport Fee Detailas 
*             tags: [Accountant Service]
*             summary: "Create Transport Fee Detailas, only accessed by Accountant"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 route:
*                                     type: string
*                                 fee:
*                                     type: number
*                                 vehiclenumber:
*                                     type: string
*                                 drivername:
*                                     type: string
*                                 drivernumber:
*                                     type: string
*                                 driversalary:
*                                     type: number
*                                 vehicletype:
*                                     type: number
*                                 vehiclecolor:
*                                     type: string
*                                 vehicleexpense:
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
*     /studentfeeservice/gettransportfee:
*       get:
*          description: Get Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Transport Fee Details, only access by Accountant  
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/deletetransportfee/{transportfeeid}:
*       delete:
*          description: Delete Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: transportfeeid
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
*     /studentfeeservice/gettetransportfee/{transportfeeid}:
*       get:
*          description: Get Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: transportfeeid
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
*     /studentfeeservice/createexpense:
*         post:
*             description: Create Expense Fee Detailas 
*             tags: [Accountant Service]
*             summary: "Create Expense Fee Detailas, only accessed by Accountant"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 expense:
*                                     type: string
*                                 expenseamount:
*                                     type: number
*                                 expensedate:
*                                     type: string
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /studentfeeservice/getexpense:
*       get:
*          description: Get Expense Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Expense Details, only access by Accountant  
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/deleteexpense/{expensedetailsid}:
*       delete:
*          description: Delete Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: expensedetailsid
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
*     /studentfeeservice/gettetransportfee/{expensedetailsid}:
*       get:
*          description: Get Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: expensedetailsid
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
*     /studentfeeservice/getstaffsalary:
*       get:
*          description: Get Staff Salary, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Staff Salary, only access by Accountant  
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getstudenttransportfee/{adharnumber}:
*       get:
*          description: Get Student Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: adharnumber
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