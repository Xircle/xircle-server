class SuccessDto<T>{
    public success=true;
    public code=200;
    public message:string;
    public data:T;

    constructor(message: string,data?:T) {
        this.message=message;
        this.data=data;
    }
}

export default SuccessDto;