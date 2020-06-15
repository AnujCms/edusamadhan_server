const router = require('express').Router();
const principalDB = require("../database/PrincipalDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/Principal.js');
const middleWare = require('../apiJoi/middleWare.js');
const publisher = require('../pubsub/publisher');
const generator = require('generate-password');

var isPrincipal = function (req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Principal) {
        return next();
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Unauthenticted user." });
    }
}
let checkTeacherBelongsToAccount = async function (req, res, next) {
    let result = await principalDB.checkProviderByAccountID(req.params.teacherid, req.user.accountid);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Principal and Teacher are not belongs to same account." });
    }  
}

let checkTeacherBelongsToAccountPost = async function (req, res, next) {
    let result = await principalDB.checkProviderByAccountID(req.body.teacherid, req.user.accountid);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Principal and Teacher are not belongs to same account." });
    }  
}

const staffObject = middleWare(joiSchema.staffObject, "body", true);
const teacherIdParams =  middleWare(joiSchema.teacherIdParams, "params", true);
const subjectIdParams =  middleWare(joiSchema.subjectIdParams, "params", true);
const assignClasstoFaculty = middleWare(joiSchema.assignClasstoFaculty, "body", true);
const assignSubjectToClass = middleWare(joiSchema.assignSubjectToClass, "body", true);

//create or Update staff only accessed by principal
router.post("/createstaff", isPrincipal, staffObject, async function (req, res) {
    let password = generator.generate({ length: 10, numbers: true });
    let img = req.body.images;
    var image;
    if (img == null) {
        image = img
    } else if (img.length == 0) {
        image = null
    } else {
        image = img
    }
    if(req.body.images !== '' && req.body.images != null){
        var encryptimg =  image.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    let teacherObj = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        emailid: encrypt.encrypt(req.body.emailid.toLowerCase()),
        username: encrypt.computeHash(req.body.emailid.toLowerCase()),
        cellnumber: encrypt.encrypt(req.body.cellnumber),
        dob: encrypt.encrypt(req.body.dob),
        gender: req.body.gender,
        qualification: req.body.qualification,
        subject: req.body.subject,
        adharnumber: req.body.adharnumber,
        password: encrypt.getHashedPassword(req.body.adharnumber),
        parmanentaddress: req.body.parmanentaddress,
        localaddress: req.body.localaddress,
        userrole: req.body.userrole,
        status: 1,
        images: encryptimg,
        session:JSON.parse(req.user.configdata).session,
        classid: 0,
        section: 0,
        salary: req.body.salary
    };
    let userRole = '';
    if(req.body.userrole === 3){
        userRole = 'Faculty'
    }else if(req.body.userrole === 4){
        userRole = 'Examination Head'
    }else if(req.body.userrole === 5){
        userRole = 'Accountant'
    }
    let result = '';
    if(req.body.teacherid){
        var publishEvent = {
            "emailId": req.body.emailid.toLowerCase(),
            "staffName": req.body.firstname + " " + req.body.lastname,
            "schoolName": req.user.accountname,
            "principalName": req.user.firstname + " " + req.user.lastname,
            "tempPassword": password,
            "userRole": userRole
        }
        // publisher.publishEmailEventForCreateStaff(publishEvent);

        result = await principalDB.updateTeacherDetails(req.body.teacherid, teacherObj);
    }else{
        var publishEvent = {
            "emailId": req.body.emailid.toLowerCase(),
            "staffName": req.body.firstname + " " + req.body.lastname,
            "schoolName": req.user.accountname,
            "principalName": req.user.firstname + " " + req.user.lastname,
            "tempPassword": password,
            "userRole": userRole
        }
        result = await principalDB.createTeacher(teacherObj, req.user.userid, req.user.accountid);
        if(result == 1){
            // publisher.publishEmailEventForCreateStaff(publishEvent);
        }
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `${userRole} has been created successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: `${userRole} is not created.` });
    }
});

//get teacher details for update by principal
router.get("/getteacherdetailforupdate/:teacherid", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await principalDB.getTeacherDetailForUpdate(req.params.teacherid);
    if (result.length > 0) {
        let row = result[0];
        let teacherObj = {
            userid: row.userid,
            firstname: row.firstname,
            lastname: row.lastname,
            dob: encrypt.decrypt(row.dob),
            gender: row.gender,
            cellnumber: encrypt.decrypt(row.cellnumber),
            emailid: encrypt.decrypt(row.emailid),
            adharnumber: row.adharnumber,
            gender: row.gender,
            subject: row.subject,
            qualification: row.qualification,
            userrole: row.userrole,
            localaddress: row.localaddress,
            parmanentaddress: row.parmanentaddress,
            images:row.images,
            salary: row.salary
        };
        res.status(200).json({ status: 1, statusDescription: teacherObj })
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get teacher details.' })
    }
});

//Delete Users
router.get("/deleteusers/:teacherid", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let results = await principalDB.deleteUsers(req.params.teacherid);
    if(results.affectedRows){
        res.status(200).json({status:1, statusDescription:"User has been deleted successfully."});
    }else{
        res.status(200).json({status:0, statusDescription:"You can not delete class teacher. You want to delete then first unassigned class."});
    }
})

//assign class by principal
router.post("/assignclasstofaculty", isPrincipal, checkTeacherBelongsToAccountPost, assignClasstoFaculty, async function (req, res) {
    let classObject = {
        classid: req.body.selectedClass,
        section: req.body.selectedSection
    }
    let result = await principalDB.assignClassToTeacher(req.body.teacherid, classObject, req.user.accountid);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: 'Class has been assigned successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'This class and section is already assigned some other teacher.' });
    }
});

//Unassigned class
router.get("/unassignedclass/:teacherid", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let results = await principalDB.unAssignedClass(req.params.teacherid);
    if(results.affectedRows){
        res.status(200).json({status:1, statusDescription:"Class has been unassigned successfully."});
    }else{
        res.status(200).json({status:0, statusDescription:"Not able to unassigned class."});
    }
})

//get account
router.get("/getAccountByPrincipal", isPrincipal, async function (req, res) {
    let results = await principalDB.getAllAccounts(req.user.userid);
    if(results.length > 0){
        results.forEach(function (result) {
            result.accountname = result.accountname;
            result.accountid = result.accountid
        });
        res.status(200).json({status:1, statusDescription:results});
    }else{
        res.status(200).json({status:0, statusDescription:'Not able to get the acoount.'});
    }
});

//get teachers of selected school
router.get("/teachers", isPrincipal, async function (req, res) {
    let results = await principalDB.getAllProvidersByAccountId(req.user.accountid, req.user.userid);
    if (results.length > 0) {
        let teacherObj = [];
        results.forEach(function (result) {
            teacherObj.push({
                userid: result.userid,
                firstname: result.firstname,
                lastname: result.lastname,
                adharnumber:result.adharnumber,
                emailid: encrypt.decrypt(result.emailid),
                cellnumber: encrypt.decrypt(result.cellnumber),
                gender: result.gender,
                class: result.classid,
                qualification: result.qualification,
                userrole: result.userrole,
                subject: result.subject,
                section: result.section,
                images:result.images
            })
        });
        res.status(200).json({ status: 1, statusDescription: teacherObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the teachers details.' });
    }
});

//get students by principal
router.get("/students/:teacherid", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let result = await principalDB.getAllStudentsByPrincipal(req.params.teacherid);
    if (result.length > 0) {
        var resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                studentid: row.userid,
                firstname: encrypt.decrypt(row.firstname),
                lastname: encrypt.decrypt(row.lastname),
                mothername: row.mothername,
                fathername: row.fathername,
                cellnumber: encrypt.decrypt(row.cellnumber),
                adharnumber: row.adharnumber,
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                images:row.images
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'There are no student found for this teacher.' });
    }
});

//get config Details
router.get("/configDetails", isPrincipal, async function (req, res) {
    let results = await principalDB.getConfigByAccountId(req.user.accountid, req.user.userid);
    if (results) {
        res.status(200).json({ status: 1, statusDescription: results });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get config details' });
    }
});

//get assigned class
router.get("/getAssignedClass/:teacherid", isPrincipal, teacherIdParams, checkTeacherBelongsToAccount, async function (req, res) {
    let assignClass = await principalDB.getAssignedClass(req.params.teacherid);
    if (assignClass.length > 0) {
        res.status(200).json({ status: 1, statusDescription: assignClass });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the assign subjects.' });
    }

});

//get subjects by selected class
router.get("/getsubjectsofselectedclass/:classId", isPrincipal, subjectIdParams, async function (req, res) {
    let result = await principalDB.getSubjectForClass(req.user.userid, req.params.classId);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: JSON.parse(result[0].subjects) });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Subjects are not assigned to this class. First assign the subject.' })
    }
})
//assign subjects to selected class
router.post("/assignsubjectstoselectedclass", isPrincipal, assignSubjectToClass, async function (req, res) {
    let subjectObject ={
        userid: req.user.userid,
        class: req.body.selectedClass,
        subjects: JSON.stringify(req.body.subjectOptions)
    } 
    let result = await principalDB.assignSubjectToClass(subjectObject);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: 'Subjects assigned to selected class successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'First add the subjects.' });
    }
});
//get teacher Details
router.get("/getPrincipalDetails", isPrincipal, async (req, res) => {
    let result = await principalDB.getPrincipalDetails(req.user.userid);
    if (result.length > 0) {
        var resultObj = {
            firstname: result[0].firstname,
            lastname: result[0].lastname,
            cellnumber: encrypt.decrypt(result[0].cellnumber),
            emailid: encrypt.decrypt(result[0].emailid),
            parmanentaddress: result[0].parmanentaddress,
            localaddress: result[0].localaddress,
            image: result[0].images
        };
        res.status(200).json({ status: 1, statusDescription: resultObj })
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the Teacher details." });
    }
})

/**
* @swagger
* paths:
*     /principalservice/createstaff:
*         post:
*             description: Create Staff 
*             tags: [Principal Service]
*             summary: "Create users for school, only accessed by principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 firstname:
*                                     type: string
*                                 lastname:
*                                     type: string
*                                 cellnumber:
*                                     type: string
*                                 emailid:
*                                     type: string
*                                 dob:
*                                     type: string
*                                 gender:
*                                     type: number
*                                 qualification:
*                                     type: number
*                                 subject:
*                                     type: number
*                                 adharnumber:
*                                     type: string
*                                 parmanentaddress:
*                                     type: string
*                                 localaddress:
*                                     type: string
*                                 userrole:
*                                     type: number
*                                 salary: 
*                                     type: number
*                                 images:
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
*     /principalservice/getteacherdetailforupdate/{teacherid}:
*      get:
*          description: Get Teacher Details, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Teacher Details for Edit, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
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
*                                example:
*                                   userid: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   dob: ''
*                                   emailid: ''
*                                   gender: ''
*                                   cellnumber: ''
*                                   adharnumber: ''
*                                   subject: ''
*                                   qualification: ''
*                                   userrole: ''
*                                   parmanentaddress: ''
*                                   localaddress: ''
*                                   salary: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/deleteusers/{teacherid}:
*       get:
*          description: Delete User, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Delete User from the school, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
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
*     /principalservice/assignclasstofaculty:
*         post:
*             description: Assign class
*             tags: [Principal Service]
*             summary: "Assign class to Teacher, only accessed by principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 selectedClass:
*                                     type: number
*                                 selectedSection:
*                                     type: number
*                                 teacherid:
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
*     /principalservice/unassignedclass/{teacherid}:
*       get:
*          description: Unassign the class, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Unassign the class, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
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
*     /principalservice/getAccountByPrincipal:
*       get:
*          description: Get Account , only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Account By Principal, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   accountname: ''
*                                   accountid: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/teachers:
*       get:
*          description: Get all teachers, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get all teachers of school, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   userid: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   adharnumber: ''
*                                   emailid: ''
*                                   cellnumber: ''
*                                   gender: ''
*                                   classid: ''
*                                   qualification: ''
*                                   subject: ''
*                                   userrole: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/students/{teacherid}:
*       get:
*          description: Get students list, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get students list of selected teacher, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
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
*                                example:
*                                   userid: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   mothername: ''
*                                   fathername: ''
*                                   cellnumber: ''
*                                   gender: ''
*                                   adharnumber: ''
*                                   dob: ''
*                                   religion: ''
*                                   category: ''
*                                   locality: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /principalservice/configDetails:
*       get:
*          description: Get Config Details, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Config Details od School, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /principalservice/getAssignedClass/{teacherid}:
*       get:
*          description: Get assigned class, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get assigned class of a teacher, only access by Prinipal 
*          parameters:
*              - in: path
*                name: teacherid
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
*     /principalservice/getsubjectsofselectedclass/{classId}:
*       get:
*          description: Get Subjects of Selected Class, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Subjects of Selected Class, only access by Prinipal 
*          parameters:
*              - in: path
*                name: classId
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
*     /principalservice/assignsubjectstoselectedclass:
*         post:
*             description: Assign Subjects to Selected Class
*             tags: [Principal Service]
*             summary: "Assign Subjects to Selected Class, only accessed by principal"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 selectedClass:
*                                     type: number
*                                 subjectOptions:
*                                     type: array
*                                     items:
*                                       type: integer
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /principalservice/getPrincipalDetails:
*       get:
*          description: Get Principal Details, only access by Prinipal 
*          tags: [Principal Service]
*          summary: Get Principal Details, only access by Prinipal 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   firstname: ''
*                                   lastname: ''
*                                   emailid: ''
*                                   cellnumber: ''
*                                   localaddress: ''
*                                   parmanentaddress: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*/

module.exports = router;