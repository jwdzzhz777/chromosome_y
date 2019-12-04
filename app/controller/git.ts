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
}
