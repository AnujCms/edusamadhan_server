
var UsersEnum = {};

UsersEnum.UserType = {
    "UpToFifth": 1,
    "SixToTwelve": 2
}
    UsersEnum.UserRoles = {
        "SuperAdmin": 1,
        "Director": 2,
        "Principal": 3, 
        "Manager": 4,    
        "Teacher": 5,
        "ExamHead": 6,
        "FeeAccount": 7,
        "Student": 8,
        "FirstTime": 9,
        "Inactive": 10,
        "EntranceStudent": 11,
        "EntranceCompleted": 12
    }

    UsersEnum.UserStatus = {
        "Pending":0,
        "Active": 1,
        "Inactive": 2,
        "Removed":3,
        "Locked": 4,
        "UnLocked": 5
    }
    UsersEnum.StudentStatus = {
        "Pending":10,
        "AllowToExam":11,
        "ExamCompleted": 12,
        "Pramoted": 13,
        "Active": 1,
        "Removed":3,
        "Locked": 4,
        "UnLocked": 5
    }
    UsersEnum.AccountStatus = {
        "Active": 1,
        "Locked": 2,
        "Removed":3
    }
    UsersEnum.PublicContent = {
        "Dossier": 1,
        "Prospectus": 2,
        "SchoolInfo":3
    }
    UsersEnum.StudentStatusEnum = {
        "active": 1,
        "inactive": 2,
        "delete": 3
    }

 module.exports = UsersEnum;