import { Controller } from 'egg';
import { Api, path, query, desc } from '@jwdzzhz777/egg-genome';

@Api
export default class TestController extends Controller {
    @path('/api/test/associate')
    @query({
        fileName: 'string',
        number: 'numberString'
    })
    @desc('手动关联已有项目')
    public async associate() {
        let { query } = this.ctx;
        let { fileName, number } = this.ctx.getAndValidate(this.getMetadata('associate').query, query);

        await this.service.git.associate(fileName, +number);

        this.ctx.success({
            message: '关联成功'
        });
    }
}
