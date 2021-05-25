import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
    member : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    type:String
})
const model = mongoose.model("Room",RoomSchema);
export default model;