interface Errors {
    readonly status?: number;
    readonly data?: any;
    readonly name?: string;
}

class BaseError extends Error implements Errors {
    data: any;

    constructor(message: string, data?: any) {
        super(message);
        data && (this.data = data);
    }
}

global.BadRequest = class BadRequest extends BaseError {
    public status = 400;
    public name = 'bad request';
};

global.BadCredentials = class GitlabForbiddenError extends BaseError {
    public status = 401;
    public name = 'github Forbidden';
};

global.InternalServerError = class InternalServerError extends BaseError {
    public status = 500;
    public name = 'internal server error';
};

global.UnprocessableEntityError = class UnprocessableEntityError extends BaseError {
    public status = 422;
    public name = 'unprocessable entity';
};
