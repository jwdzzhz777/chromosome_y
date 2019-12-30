import { Controller } from 'egg';
import { Api, path, desc, query } from '@jwdzzhz777/egg-genome';

@Api
export default class GitController extends Controller {
    @path('/api/user/viewer')
    @desc('获取自己的信息')
    public async getViewer() {
        let { viewer } = await this.ctx.helper.graph({
            query: `
                query {
                    viewer {
                        id
                        name
                        login
                        email
                        bio
                        avatarUrl
                        a_s: avatarUrl (size:100)
                        a_m: avatarUrl (size:130)
                        a_l: avatarUrl (size:160)
                        avatarUrl
                    }
                }
            `
        });

        this.ctx.success(viewer);
    }
    @path('/api/github/fetch')
    @desc('更新文章至issue 并关联')
    public async fetch() {
        await this.service.article.autoBot();

        this.ctx.success({
            message: 'success'
        });
    }
}
