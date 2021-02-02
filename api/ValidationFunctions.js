const directorDB = require('../database/DirectorDB')

exports.checkDirectorAndUserBelongsToSameAccount = async (req, res, next) =>{
    let result = await directorDB.checkDirectorUserRelation(req.user.accountId, req.params.userId || req.body.userId);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Director and User are not belongs to same account." });
    }  
}

exports.checkPrincipalAndUserBelongsToSameAccount = async (req, res, next) =>{
    let result = await directorDB.checkPrincipalUserRelation(req.user.accountId, req.params.userId || reqb.body.userId);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Director and User are not belongs to same account." });
    }  
}

exports.checkTeacherAndStudentBelongsToSameAccount = async (req, res, next) =>{
    let result = await directorDB.checkTeacherStudentRelation(req.user.accountId, req.params.userId || req.body.userId);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Teacerh and Student are not belongs to same account." });
    }  
}

exports.formatDate = (d) => {
    //get the month
    let month = d.getMonth();
    //get the day
    let day = d.getDate();
    //get the year
    let year = d.getFullYear();

    //pull the last two digits of the year
    // year = year.toString().substr(2, 2);

    //increment month by 1 since it is 0 indexed
    month = month + 1;
    //converts month to a string
    month = month + "";

    //if month is 1-9 pad right with a 0 for two digits
    if (month.length == 1) {
        month = "0" + month;
    }

    //convert day to string
    day = day + "";

    //if day is between 1-9 pad right with a 0 for two digits
    if (day.length == 1) {
        day = "0" + day;
    }

    //return the string "MMddyy"
    return year + '-' + month + '-' + day;
}