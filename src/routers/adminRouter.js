import {
    getUser,
    postUser,
    patchUser,
    deleteUser,
    getPost,
    deletePost,
    update,
    update1
} from '../controllers/authController';

import {
    upload,
} from '../utils/middleware';

const adminRouter = express.Router();

adminRouter.get('/users', getUser);
adminRouter.post('/user', upload.single('profileImgSrc'), postUser);
adminRouter.patch('/user/:userId', upload.single('profileImgSrc'), patchUser);
adminRouter.delete('/user/:userId', deleteUser);
adminRouter.get('/posts', getPost);
adminRouter.delete('/post/:postId', deletePost);

adminRouter.post('/update', update);
adminRouter.get('/update', update1);

export default adminRouter;