import { Controller } from 'egg';
import { Api, path, desc } from '@jwdzzhz777/egg-genome';

@Api
export default class GitController extends Controller {
    @path('/api/github/getBlogRepo')
    @desc('获取blog项目的信息')
    public async blogRepo() {
        let data = await this.service.git.getRepositoryFileList('web-test-zhihu');

        this.ctx.success(data);
    }
}
