/*
const express=require("express");
const path=require("path");
const compression=require("compression");
const cors=require("cors");
const methodOverride=require("method-override");
const webSocket=require("./src/socket");

require("dotenv").config();

require("./db");

const app=express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static('uploads'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cors());

require('./src/routers/adminRouter')(app);
require('./src/routers/chatRouter')(app);
require('./src/routers/authRouter')(app);
require('./src/routers/profileRouter')(app);
require('./src/routers/postRouter')(app);
require('./src/routers/userRouter')(app);

app.get('/',(req,res)=>{
    return res.send("hello developers");
});

app.use((err,req,res,next)=>{
    return res.json({
        code:500,
        success:false,
        message:'서버 에러'
    });
 });

const server=app.listen(process.env.PORT);

webSocket(server, app);
*/

import express from 'express';
import compression from 'compression';
import cors from 'cors';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import 'dotenv/config'

import errorMiddleware from './src/utils/error.middleware';
import Controller from './src/routers/controller.interface';
import HttpException from './src/utils/HttpException';


class App{
    public app:express.Application;

    constructor(controllers:Controller[]){
        this.app=express();
        this.initializeMiddlewares();
        this.connectDatabase();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen(){
        this.app.listen(process.env.PORT,()=>{
            console.log(`App listening on port ${process.env.PORT}`);
        })
    }

    private initializeMiddlewares(){
        this.app.use(express.static('uploads'));
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(methodOverride());
        this.app.use(cors());
    }

    private initializeControllers(controllers:Controller[]) {
        controllers.forEach((controller:Controller) => {
          this.app.use('/', controller.router);
        });
      }


    private connectDatabase(){
        mongoose.connect(process.env.MONGO_URI!,{
            useNewUrlParser: true,
            useUnifiedTopology: true 
        },(err)=>{
            console.log(err);
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
      }

}

export default App;
