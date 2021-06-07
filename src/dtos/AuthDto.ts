import {
    IsBoolean, IsMimeType,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';


class CheckEmailDto{

    @IsString()
    public email:string;

    @IsNumber()
    public code:number;
}

class CheckNameDto{
    @IsString()
    public displayName:string;
}

class SendEmailDto{
    @IsString()
    public email:string;
}

class PostUserData{
    
    @IsNumber()
    public age:number;

    @IsString()
    public gender:string;

    @IsString()
    public job:string;

    @IsString()
    public adj:string;

    @IsString()
    public displayName:string;

    @IsString()
    public email:string;

    @IsNumber()
    public location:number;

    @IsString()
    public phoneNumber:string;

    @IsBoolean()
    public isPublic:boolean;

    @IsBoolean()
    public isGraduate:boolean;

    @IsOptional()
    @IsNumber()
    public latitude:number;

    @IsOptional()
    @IsNumber()
    public longitude:number;

    @IsString()
    public password:string;


    @IsString({each:true})
    public interestArr:string[];
}

class PostUserDto{

    @IsMimeType()
    public profileImgSrc:any;

    @IsNotEmpty()
    public data:PostUserData;
}

class PostUserResDto{
    public token:string;
    public userId:string;

    constructor(token:string,userId:string) {
        this.token=token;
        this.userId=userId;
    }
}

class LoginUserDto{
    @IsString()
    public displayName:string;
    @IsString()
    public password:string;
}

class FindInfoDto{
    @IsString()
    public email:string;
}


export {CheckEmailDto,CheckNameDto,SendEmailDto,PostUserDto,PostUserData,PostUserResDto,LoginUserDto,FindInfoDto};

