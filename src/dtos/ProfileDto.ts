import {IsBoolean, IsMimeType, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";



class GetProfileResDataDto{
    public count:number;
    public name:string;

    constructor(count: number, name: string) {
        this.count = count;
        this.name = name;
    }
}
class GetProfileResDto{

    public profileImgSrc:string;
    public adj:string;
    public job:string;
    public displayName:string;
    public gender:string;
    public university:string;
    public isGraduate:boolean;
    public isPublic:boolean;
    public location:string;
    public age:number;
    public resume:string;
    public workPlace:string;
    public introText:string;
    public isLocationPublic:boolean;
    public userId:string;
    public interestArr:GetProfileResDataDto[];
    public latitude:number;
    public longitude:number;


    constructor(profileImgSrc: string, adj: string, job: string, displayName: string, gender: string, university: string, isGraduate: boolean, isPublic: boolean, location: string, age: number, resume: string, workPlace: string, introText: string, isLocationPublic: boolean, userId: string, interestArr: GetProfileResDataDto[], latitude: number, longitude: number) {
        this.profileImgSrc = profileImgSrc;
        this.adj = adj;
        this.job = job;
        this.displayName = displayName;
        this.gender = gender;
        this.university = university;
        this.isGraduate = isGraduate;
        this.isPublic = isPublic;
        this.location = location;
        this.age = age;
        this.resume = resume;
        this.workPlace = workPlace;
        this.introText = introText;
        this.isLocationPublic = isLocationPublic;
        this.userId = userId;
        this.interestArr = interestArr;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}



class GetProfilePostData{

    public articleTitle:string;
    public articleImgSrc:string;

    constructor(articleTitle: string, articleImgSrc: string) {
        this.articleTitle = articleTitle;
        this.articleImgSrc = articleImgSrc;
    }
}

class GetProfilePostResDto{

    public userId:string;
    public post:GetProfilePostData[];

    constructor(userId: string, post: GetProfilePostData[]) {
        this.userId = userId;
        this.post = post;
    }
}

class UpdateProfileData{
    @IsString()
    public job:string;
    @IsString()
    public adj:string;
    @IsString()
    public introText:string;
    @IsString()
    public location:string;
    @IsNumber()
    public latitude:number;
    @IsNumber()
    public longitude:number;
    @IsBoolean()
    public isGraduate:boolean;
    @IsBoolean()
    public isPublic:boolean;
    @IsString()
    public resume:string;
    @IsString()
    public workPlace:string;
    @IsBoolean()
    public isLocationPublic:boolean;
}

class UpdateProfileDto{
    @IsOptional()
    @IsMimeType()
    public profileImgSrc:string;

    @IsNotEmpty()
    public data:UpdateProfileData;

}

export {GetProfileResDataDto,GetProfileResDto,
    GetProfilePostData,GetProfilePostResDto,UpdateProfileData,UpdateProfileDto};