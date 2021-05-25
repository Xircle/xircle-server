import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({

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
const model = mongoose.model("Post",PostSchema);
export default model;