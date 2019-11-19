import { Controller } from 'egg';
import { Api, path, desc } from '@jwdzzhz777/egg-genome';

@Api
export default class GitController extends Controller {
    @path('/api/user/owner')
    @desc('获取自己的信息')
    public async getViewr() {
        let data = await this.ctx.helper.graph({
            query: `
                query {
                    viewer {
                        id
                        name
                        login
                        email
                        bio
                        avatarUrl
                    }
                }
            `
        });

        this.ctx.success(data);
    }
}
