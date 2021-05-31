import mongoose from 'mongoose';


const UserSchema = new mongoose.Schema({
    
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
const model = mongoose.model("User",UserSchema);

export default model;