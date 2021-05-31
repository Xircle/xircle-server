import App from "./app";
import express from 'express';
import AuthController from './src/controllers/authController';

class RootController{
    public path="/";
    public router=express.Router();

    constructor(){
        this.initializeRoutes();
    }

    public initializeRoutes(){
        this.router.get(this.path,(req:express.Request,res:express.Response)=>{
            res.send("hello developers");
        })
    }
}


const app=new App([new RootController(),new AuthController()]);
app.listen();

