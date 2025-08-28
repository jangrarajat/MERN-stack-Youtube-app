class ApiError extends Error {
    constructor(statusCode,
        message="Something went wrong",
        errors =[],
        statck=""
    ){
        super(error)
        this.statusCode=statusCode
        this.data=null
        this.message=false;
        this.errors = errors


        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this.this.constructor)
        }
    }
}

export {ApiError}