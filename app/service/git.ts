import { Service } from 'egg';
import { GitArticleObjectType } from '../types/git';

export default class GithubService extends Service {
    /**
     * 获取所有文章的信息
     * @return 返回信息用于查找数据库对应记录或者创建一个新的 Issue
     */
    async getArticleList(): Promise<{
        assigneeId: string,
        repositoryId: string,
        labelId: string,
        files: GitArticleObjectType[]
    }> {
        let { BLOG_REPOSITORY, ARTICLES_PATH, ARTICLE_REF, ARTICLE_LABEL } = this.config.github;
        /** 拿到全部文章文件的信息 */
        let {
            viewer: {
                id: assigneeId,
                repository: {
                    id: repositoryId,
                    label: { id: labelId },
                    articles: { files }
                }
            }
        } = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $expression: String!, $label: String!) {
                    viewer {
                        id
                        repository (name: $name_of_repository) {
                            id
                            label (name: $label) {
                                id
                            }
                            articles: object (expression: $expression) {
                                ... on Tree {
                                    files: entries {
                                        oid
                                        name
                                        type
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                'name_of_repository': BLOG_REPOSITORY,
                expression: `${ARTICLE_REF}:${ARTICLES_PATH}`,
                label: ARTICLE_LABEL
            }
        });

        return { assigneeId, repositoryId, labelId, files };
    }
    /**
     * 通过 oid 获得文件的内容
     * @param  {string}  oid  文件的 objectId
     * @return     文件的内容
     */
    async getArticleContext(oid: string) {
        let { BLOG_REPOSITORY } = this.config.github;
        /** 拿到文件的内容 */
        let { viewer: { repository: { article: { text } } } } = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $oid: GitObjectID!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            article: object (oid: $oid) {
                                ... on Blob {
                                    text
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                'name_of_repository': BLOG_REPOSITORY,
                oid
            }
        });

        return text;
    }
    /**
     * 创建一个 Issue
     * @param  {object} input        变异的内容
     * @param  {string} input.assigneeIds  指派给谁(id) 当然肯定是我自己
     * @param  {string} input.body         issue 内容
     * @param  {string[]} input.labelIds     标签 id 代表 article 的标签肯定要加
     * @param  {string[]} input.projectIds   暂时不需要 但是必填
     * @param  {string} input.repositoryId 所在仓库的id
     * @param  {string} input.title        标题
     * @return              创建好的 Issue id
     */
    async createIssue (input: {
        assigneeIds: string,
        body: string,
        labelIds: string[],
        projectIds: string[],
        repositoryId: string,
        title: string
    }) {
        let data = await this.ctx.helper.graph({
            mutation: `
                createIssue(input:{
                    assigneeIds: $assigneeIds!,
                    body: $body,
                    labelIds: $labelIds!,
                    projectIds: $projectIds!,
                    repositoryId: $repositoryId!,
                    title: $title
                }) {
                    issue {
                        id
                    }
                }
            `,
            variables: input
        });

        return data;
    }

    async updateIssue () {

    }

    async getLastCommitDate(fileName: string): Promise<Date> {
        let { BLOG_REPOSITORY, ARTICLES_PATH } = this.config.github;

        let {
            viewer: { repository: { defaultBranchRef: { target: { history: {
                    edges: [{ node: { pushedDate } }]
                } } } }
            }
        } = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $path: String!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            defaultBranchRef {
                                target {
                                    ... on Commit {
                                        history(first: 1, path: $path) {
                                            edges {
                                                node {
                                                    pushedDate
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                'name_of_repository': BLOG_REPOSITORY,
                path: `${ARTICLES_PATH}/${fileName}`
            }
        });

        return new Date(pushedDate);
    }
    async associate(fileName: string, number: number) {
        let { ARTICLES_PATH, ARTICLE_REF } = this.config.github;

        // 先通过fileName获取 oid
        // 自己处理报错
        let result = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $expression: String!, $number: Int!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            article: object (expression: $expression) {
                                oid
                            }
                            issue (number: $number) {
                                id
                                title
                            }
                        }
                    }
                }
            `,
            variables: {
                'name_of_repository': this.config.github.BLOG_REPOSITORY,
                expression: `${ARTICLE_REF}:${ARTICLES_PATH}/${fileName}`,
                number
            }
        }, true);

        if (!result.data) throw new InternalServerError('github 服务异常');

        let { viewer: { repository: { article, issue } } } = result.data;

        if (!issue) throw new InternalServerError('Issue不存在');
        if (!article) throw new InternalServerError('article不存在');

        // 通过 oid 查找数据库是否有记录该 oid 的东西
        let fileData = await this.ctx.model.Articles.findOne({
            where: { oid: article.oid },
            attributes: [ 'id' ],
            raw: true
        });

        // 通过 issueId 查找数据库是否有记录该 issueId 的东西
        let issueData = await this.ctx.model.Articles.findOne({
            where: { issueId: number },
            attributes: [ 'id' ],
            raw: true
        });

        /*
        当都没有关联才可以进行关联
        正常情况下不会出现一个关联一个没有关联
         */
        if (fileData === null && issueData === null) {
            /** 拿到文件最后提交时间 */
            let date = await this.getLastCommitDate(fileName);

            await this.ctx.model.Articles.create({
                oid: article.oid,
                issueId: number,
                title: issue.title,
                publishedAt: date,
                issueUpdatedAt: date
            });
        }
    }
    /**
     * 通过 number 获得 Issue id
     * @param  number Issue 的 number
     * @return        id
     */
    async getIssueByNumber(number: number) {
        let { viewer: { repository: { issue: { id } } } } = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $number: Number!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            issue (number: $number) {
                                id
                            }
                        }
                    }
                }
            `,
            variables: {
                'name_of_repository': this.config.github.BLOG_REPOSITORY,
                number
            }
        });

        return id;
    }
}
