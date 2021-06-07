import mongoose from 'mongoose';

interface User extends mongoose.Document{
    _id:string;
    age : number;
    adj: string;
    profileImgSrc : string;
    gender : string;
    introText : string;
    job: string;
    displayName : string;
    email : string;
    location : string;
    university: string;
    createdAt : Date;
    hashtags : string[];
    mainHashtags:string[];
    followings :string[];
    followers : string[];
    blockedUsers:string[];
    isPublic:boolean;
    isGraduate:boolean;
    phoneNumber:string;
    workPlace:string;
    resume:string;
    password:string;
    isLocationPublic:boolean;
    position:number[];

}

const UserSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    age : Number, 
    adj: String,
    profileImgSrc : String, 
    gender : String,
    introText : String,
    job: String, 
    displayName : {type:String, unique:true}, 
    email : {type:String,unique:true},
    location : String, 
    university: String, 
    createdAt : {type:Date , default: Date.now},
    hashtags : [
        {
            type: String
        }
    ], 
    mainHashtags: [
        {
            type: String
        }
    ],

    followings :[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    followers : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    blockedUsers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    isPublic:Boolean,
    isGraduate:Boolean,
    phoneNumber:String,
    workPlace:String,
    resume:String,
    password:String,
    isLocationPublic:Boolean,
    position:[{type:Number}]
})
const model = mongoose.model<User>("User",UserSchema);

export default model;