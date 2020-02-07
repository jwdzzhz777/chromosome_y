import { Controller } from 'egg';
import { Api, path, desc } from '@jwdzzhz777/egg-genome';

@Api
export default class GitController extends Controller {
    @path('/api/user/viewer')
    @desc('获取自己的信息')
    public async getViewer() {
        let viewer = await this.ctx.model.Users.findOne({
            where: { login: 'jwdzzhz777' },
            raw: true
        });

        if (!viewer) {
            viewer = await this.service.git.getMyInfoFromGit();
        }

        this.ctx.success(viewer);
    }
    @path('/api/github/fetch')
    @desc('更新文章至issue 并关联')
    public async fetch() {
        this.service.article.autoBot();
        
        this.ctx.success({
            message: '触发更新'
        });
    }
}
