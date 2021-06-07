import {IsString} from "class-validator";

class UserIdParamsDto{
    @IsString()
    public userId:string;
}

class InterestQueryDto{
    @IsString()
    public interest:string;
}

class PostIdParamsDto{
    @IsString()
    public postId:string;
}

class RoomIdParamsDto{
    @IsString()
    public roomId:string;
}

export {UserIdParamsDto,InterestQueryDto,PostIdParamsDto,RoomIdParamsDto};