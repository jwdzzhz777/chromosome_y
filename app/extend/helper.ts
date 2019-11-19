import { IHelper } from 'egg';

export default {
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
            query: string,
            variables?: object
        }
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
                data: JSON.stringify(params)
            });

            /** 请求成功 */
            if (status === 200) {
                /** graphql 查询失败 */
                if (errors) throw errors.reduce(
                    (total: string, current: { message: string }, index: number) => `${total} ${index + 1}. ${current.message}`,
                    ''
                );
                return data;
            } else if (status === 401) throw new BadCredentials('github token 过期'); // github token 过期
            else throw message; // 其他情况

        } catch (e) {
            this.ctx.logger.error(e);
            throw new InternalServerError('github 服务异常');
        }
    }
}
