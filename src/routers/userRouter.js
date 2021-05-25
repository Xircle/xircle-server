import express from 'express';
import {
    follow,
    getUsers
} from '../controllers/userController';
import {
    upload,
    verify
} from '../utils/middleware';

const userRouter = express.Router();

userRouter.get('/users', verify, user.getUsers);
// app.patch('/user/:userId/follow',verify,user.follow);

export default userRouter;