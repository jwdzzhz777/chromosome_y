import { Context } from 'egg';

export default {
    success(this: Context, data: any) {
        this.body = {
            code: 200,
            message: 'success',
            success: true,
            data
        };
    }
}
