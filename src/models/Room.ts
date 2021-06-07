import mongoose from 'mongoose';

interface Room extends mongoose.Document{
    _id:string;
    member:string[];
    type:string;
}

const RoomSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    member : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    type:String
})
const model = mongoose.model<Room>("Room",RoomSchema);
export default model;