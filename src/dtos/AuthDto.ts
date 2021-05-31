import {IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString} from 'class-validator';

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

    @IsNumber()
    public latitude:number;

    @IsNumber()
    public longitude:number;

    @IsString()
    public password:string;

    @IsArray()
    public interestArr:string[];
}

class PostUserDto{

    @IsNotEmpty()
    public profileImgSrc:any;

    @IsNotEmpty()
    public data:PostUserData;
}

export {CheckEmailDto,CheckNameDto,SendEmailDto,PostUserDto,PostUserData};

