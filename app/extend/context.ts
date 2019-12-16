import { Context } from 'egg';

export default {
    /**
     * 验证并返回子集
     * @param  rule   validator 的验证规则
     * @param  target 目标对象
     * @return        对应子集
     */
    getAndValidate(this: Context, rule: object, target?: object): any {
        target = target || this.request.body;

        const errors = this.app.validator.validate(rule, target);

        if (errors) {
            let errorMessage = errors.map(error => `${error.field}: ${error.message}`).join(' / ');
            throw new UnprocessableEntityError(`参数错误: ${errorMessage}`);
        }

        return this.helper.subset(target || this.request.body, Object.keys(rule));
    },
    /**
     * 封装返回的默认结构
     * @param  {Context}  this 指向this
     * @param  data 用于返回的数据
     */
    success(this: Context, data: any) {
        this.type = 'json';
        this.body = {
            code: 200,
            message: 'success',
            success: true,
            data
        };
    }
}
