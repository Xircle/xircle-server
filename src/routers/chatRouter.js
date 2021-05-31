module.exports = (app)=>{
    const chat = require('../controllers/chatController');
    const {verify,pager}=require('../utils/middleware');

    app.get('/chat/user/:userId/room',verify,pager,chat.getChatRoom);
    app.get('/chat/user/:userId/room/:roomId',verify,pager,chat.getChat);

    app.post('/chat/message',verify,chat.createMessage);
}