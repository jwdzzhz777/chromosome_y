import { Application } from 'egg';

export default {
    numberString: (app: Application) => {
        /** 判断是不是数字类型的字符串 '123' */
        return (rule, value: string): any => {
            const error = app.validator.validate({ some: 'number' }, { some: +value });
            if (error) return error;
        }
    }
}
