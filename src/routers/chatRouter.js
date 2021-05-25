import express from 'express';
import {} from '../controllers/chatController';
const {
    verify
} = require('../utils/middleware');

const chatRouter = express.Router();

chatRouter.get('/',verify,chat.getChat);
chatRouter.post('/message',verify,createRoom);

export default chatRouter;