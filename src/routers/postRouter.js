module.exports = (app)=>{
    const post = require('../controllers/postController');
    const {upload,verify,resize}=require('../utils/middleware');

    
    app.post('/post',verify,upload.single('articleImgSrc'),resize,post.postPost);
    
    app.get('/post/user/:userId',verify,post.getPost);

    app.put('/post/:postId',verify,upload.single('articleImgSrc'),resize,post.updatePost);

    app.delete('/post/:postId',verify,post.deletePost);

    app.get('/post/search/tag',verify,post.searchHashtag);
    app.get('/post/search',verify,post.searchPost);

    //app.patch('/post/:postId/like',verify,post.likePost);
}