import { Types } from "mongoose"
import { TUserRole } from "../../constents"

export type TUser={
    name:string,
    phone:string,
    email:string,
    password:string,
    confirmPassword:string,
    aggriedToTerms:boolean,
    role?:TUserRole,
    isDeleted?:string,
    isBlocked?:boolean,
    isLoggedIn?:boolean,
    loggedOutTime?:Date
    passwordChangeTime?:Date
}

export type TProfile={
    fullName:string,
    phone:string,
    email:string,

    img?:string,
    age?:number,
    gender?:"male"|"female",
    hight?:number,
    weight?:number,
    recidenceArea?:string,

    user_id:Types.ObjectId,

    isDeleted?:boolean,
}


