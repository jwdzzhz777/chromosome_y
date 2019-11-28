import { Context } from 'egg';

export default () => {
    return async (ctx: Context, next: () => Promise<any>) => {
        ctx.type = 'json';
        await next();
    };
};
