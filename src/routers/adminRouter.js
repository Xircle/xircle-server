module.exports = (app)=>{
    const admin = require('../controllers/adminController');
    const {upload,resize}=require('../utils/middleware');

    app.get('/admin/users',admin.getUser);
    app.post('/admin/user',upload.single('profileImgSrc'),admin.postUser);
    app.patch('/admin/user/:userId',upload.single('profileImgSrc'),admin.patchUser);
    app.delete('/admin/user/:userId',admin.deleteUser);
    app.get('/admin/posts',admin.getPost);
    app.delete('/admin/post/:postId',admin.deletePost);

    app.post('/admin/update',admin.update);
    app.get('/admin/update',admin.update1);

}