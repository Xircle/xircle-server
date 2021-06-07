import mongoose from 'mongoose';

interface Chat extends mongoose.Document{
    _id:string;
    message:string;
    roomId:string;
    userId:string;
    createdAt:Date;
}

const ChatSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    message:String,
    roomId:mongoose.Schema.Types.ObjectId,
    userId:mongoose.Schema.Types.ObjectId,
    createdAt : {type:Date , default: Date.now},
})
const model = mongoose.model<Chat>("Chat",ChatSchema);
export default model;