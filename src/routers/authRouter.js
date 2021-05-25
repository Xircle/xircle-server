import express from 'express';
import {
    checkEmail,
    sendEmail,
    checkName,
    postUser,
    login,
    findInfo
} from '../controllers/authController';
import {
    upload,
    verify,
    resize
} from '../utils/middleware';

const authRouter = express.Router();

authRouter.post('/check/email', checkEmail);
authRouter.post('/email', sendEmail);
authRouter.post('/check/name', checkName);
authRouter.post('/user', upload.single('profileImgSrc'), resize, postUser);
authRouter.post('/login', login);
authRouter.post('/find/info', findInfo);

export default authRouter;