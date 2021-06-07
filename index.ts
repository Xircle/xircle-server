import App from "./app";
import express from 'express';
import AuthController from './src/controllers/authController';
import UserController from './src/controllers/userController';
import ProfileController from './src/controllers/profileController';
import PostController from "./src/controllers/postController";
import ChatController from "./src/controllers/chatController";

class RootController{
    public router=express.Router();

    constructor(){
        this.initializeRoutes();
    }

    public initializeRoutes(){
        this.router.get("/",(req:express.Request,res:express.Response)=>{
            res.send("hello developers");
        })
    }
}


const app=new App([new RootController(),new AuthController(),new UserController(),
new ProfileController(),new PostController(),new ChatController()]);
app.listen();

