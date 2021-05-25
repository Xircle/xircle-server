import express from 'express';
import { getProfile, getPost, updateProfile } from '../controllers/profileController';
import {
    upload,
    verify,
    resize
} from '../utils/middleware';

const profileRouter = express.Router();

profileRouter.get('/:userId/profile', verify, getProfile);

profileRouter.get('/:userId/profile/post', verify, getPost);

profileRouter.put('/profile', upload.single('profileImgSrc'), resize, verify, updateProfile);

export default profileRouter;