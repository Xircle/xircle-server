import mongoose from 'mongoose';

interface Post extends mongoose.Document{
    _id:string;
    userId:string;
    content:string;
    createdAt:Date;
    title:string;
    uploadedPhoto:string[];
    likeUserId:string[];
    hashtags:string[];
    extraHashtags:string[];
}

const PostSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    userId : mongoose.Schema.Types.ObjectId,
    content : String,
    createdAt : {type:Date , default: Date.now},
    title :String,
    uploadedPhoto : [
        {
            type: String
        }
    ],

    likeUserId : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    hashtags:[
        {
            type:String
        }
    ],
    extraHashtags:[
        {
            type:String
        }
    ]
    
})
const model = mongoose.model<Post>("Post",PostSchema);
export default  model;