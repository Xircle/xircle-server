import { IsMimeType, IsNotEmpty, IsOptional, IsString} from "class-validator";


class PostPostData{
    @IsString()
    public articleContent:string;

    @IsString({each:true})
    public articleInterest:string[];

    @IsString()
    public articleTitle:string;

    @IsString({each:true})
    public articleTagArr:string[]


}

class PostPostDto{
    @IsMimeType()
    public articleImgSrc:string;

    @IsNotEmpty()
    public data:PostPostData;
}

class GetPostResDto{

    public articleImgSrc:string;

    public postId:string;

    public articleTitle:string;

    public content:string;
    public createdAt:string;


    constructor(articleImgSrc: string, postId: string, articleTitle: string, content: string, createdAt: string) {
        this.articleImgSrc = articleImgSrc;
        this.postId = postId;
        this.articleTitle = articleTitle;
        this.content = content;
        this.createdAt = createdAt;
    }
}

class UpdatePostDto{
    @IsOptional()
    @IsMimeType()
    public articleImgSrc:string;

    @IsNotEmpty()
    public data:PostPostData;

}


export {PostPostData,PostPostDto,GetPostResDto,UpdatePostDto};