import { Controller } from 'egg';
import { Api, path, desc, query } from '@jwdzzhz777/egg-genome';

@Api
export default class ArticleController extends Controller {
    @path('/api/article/owner')
    @desc('获取自己的信息')
    public async getViewer() {
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
    @path('/api/article/list')
    @desc('获取项目列表')
    public async getArticleList() {
        let data = await this.ctx.model.Articles.findAll({
            attributes: ['issueNumber', 'publishedAt', 'img', 'title']
        });
        this.ctx.success(data);
    }
    @path('/api/article/context')
    @query({
        number: 'numberString'
    })
    @desc('获取文章内容')
    public async getArticle() {
        let { number } = this.ctx.getAndValidate(this.getMetadata('getArticle').query, this.ctx.query);
        let issue = await this.ctx.service.git.getIssueByNumber(+number);
        this.ctx.success(issue);
    }
}
