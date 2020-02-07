import { IHelper } from 'egg';

// 是否为空
const isEmpty = (val: any): boolean => val === undefined || val === null || val === '';

/**
 * 获得对象的子集 空值剔除
 * @param {Object} parent  目标集合
 * @param {Array<string>} keys  子集的字段名
 * @return     新的集合
 */
const subset = (parent: object, keys: string[]): object => {
    let newObj = {};
    keys.forEach(key => {
        if (!isEmpty(parent[key])) {
            newObj[key] = parent[key];
        }
    });
    return newObj;
};

export default {
    isEmpty,
    subset,
    /**
     * 用于请求 graphql
     * @param  {IHelper} this      egg helper 对象
     * @param  {object} params    用于查询 graphql 的语句
     * @param  {string} params.query    查询语句
     * @param  {object} params.variables 查询语句的变量
     * @return           response data
     */
    async graph(
        this: IHelper,
        params: {
            query?: string,
            variables?: object
        },
        quite: boolean = false
    ) {
        const { ctx, config: { github } } = this;

        try {
            let { data: { data, errors, message }, status } = await ctx.curl(github.API, {
                headers: {
                    Authorization: `Bearer ${github.ACCESS_TOKEN}`
                },
                method: 'POST',
                dataType: 'json',
                contentType: 'json',
                timeout: 10000,
                data: JSON.stringify(params)
            });

            /** 请求成功 */
            if (status === 200) {
                if (quite) {
                    return {
                        data,
                        errors,
                        message
                    };
                }
                /** graphql 查询失败 */
                if (errors) throw errors.reduce(
                    (total: string, current: { message: string }, index: number) => `${total} ${index + 1}. ${current.message}`,
                    ''
                );
                return data;
            } else if (status === 401) throw new BadCredentials('github token 过期'); // github token 过期
            else throw message; // 其他情况

        } catch (e) {
            this.ctx.logger.error(`-----------------------------------`);
            this.ctx.logger.error(e);
            this.ctx.logger.error(`-----------------------------------`);
            throw new InternalServerError('github 服务异常');
        }
    }
}
