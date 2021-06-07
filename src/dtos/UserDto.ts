import {IsNumberString, IsOptional, IsString} from "class-validator";

class GetUserQueryDto{
    @IsOptional()
    @IsString()
    public university:string;

    @IsOptional()
    @IsString()
    public age:string;

    @IsOptional()
    @IsString()
    public gender:string;

    @IsOptional()
    @IsNumberString()
    public location:string;
}

class GetUserResDto{
    public profileImgSrc:string;
    public adj:string;
    public job:string;
    public introText:string;
    public gender:string;
    public displayName:string;
    public sameInterest:number;
    public userId:string;
    public position:number[];

    constructor(profileImgSrc:string,adj:string,job:string,introText:string,gender:string,
                displayName:string,sameInterest:number,userId:string,position:number[]) {
        this.profileImgSrc=profileImgSrc;
        this.adj=adj;
        this.job=job;
        this.introText=introText;
        this.gender=gender;
        this.displayName=displayName;
        this.sameInterest=sameInterest;
        this.userId=userId;
        this.position=position;
    }
}

export {GetUserQueryDto,GetUserResDto};