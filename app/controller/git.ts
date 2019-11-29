import { Controller } from 'egg';
import { Api, path, desc, query } from '@jwdzzhz777/egg-genome';

@Api
export default class GitController extends Controller {
    @path('/api/github/getBlogRepo')
    @desc('获取blog项目的信息')
    public async blogRepo() {
        await this.service.article.autoBot();

        this.ctx.success({
            message: 'success'
        });
    }
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
