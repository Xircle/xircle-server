import express from 'express';
import {
    getPost,
    postPost,
    updatePost,
    deletePost,
    searchHashtag,
    searchPost
} from '../controllers/postController';
import {
    upload,
    verify,
    resize
} from '../utils/middleware';

const postRouter = express.Router();

postRouter.post('/', verify, upload.single('articleImgSrc'), resize, postPost);

postRouter.get('/user/:userId', verify, getPost);

postRouter.put('/:postId', verify, upload.single('articleImgSrc'), resize, updatePost);

postRouter.delete('/:postId', verify, deletePost);

postRouter.get('/search/tag', verify, searchHashtag);
postRouter.get('/search', verify, searchPost);

//postRouter.patch('/:postId/like',verify,likePost);

export default postRouter;