import 'egg';

declare module 'egg' {

}

declare global {
    export class BadRequest {
        constructor(message: string, data?: any);
    }

    export class InternalServerError {
        constructor(message: string, data?: any);
    }

    export class UnprocessableEntityError {
        constructor(message: string, data?: any);
    }

    export class BadCredentials {
        constructor(message: string, data?: any);
    }

    namespace NodeJS {
        interface Global {
            BadRequest: BadRequest;
            InternalServerError: InternalServerError;
            UnprocessableEntityError: UnprocessableEntityError;
            BadCredentials: GitlabForbiddenError;
        }
    }
}
