import { Controller } from 'egg';
import { Api, path, desc } from '@jwdzzhz777/egg-genome';
import { inspect } from 'util';

@Api
export default class GitController extends Controller {
    @path('/api/github/getBlogRepo')
    @desc('获取blog项目的信息')
    public async blogRepo() {

        let { assigneeId, repositoryId, labelId, files } = await this.service.git.getArticleList();

        await this.service.main.compare(files);

        this.ctx.success({
            message: 'success'
        });
    }
}
