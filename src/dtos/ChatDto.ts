import {IsString} from "class-validator";

class GetChatRoomResDto{
    public profileImgSrc:string;
    public adj:string;
    public job:string;
    public displayName:string;
    public message:string;
    public userId:string;
    public createdAt:string;

    constructor(profileImgSrc: string, adj: string, job: string, displayName: string, message: string, userId: string, createdAt: string) {
        this.profileImgSrc = profileImgSrc;
        this.adj = adj;
        this.job = job;
        this.displayName = displayName;
        this.message = message;
        this.userId = userId;
        this.createdAt = createdAt;
    }
}

class GetChatResDto{
    public message:string;
    public userId:string;
    public createdAt:string;

    constructor(message: string, userId: string, createdAt: string) {
        this.message = message;
        this.userId = userId;
        this.createdAt = createdAt;
    }
}

class PostChatDto{
    @IsString()
    public message:string;

    @IsString()
    public receiverId:string;
}

export {GetChatRoomResDto,GetChatResDto,PostChatDto};