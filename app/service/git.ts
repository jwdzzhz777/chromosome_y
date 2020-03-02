import { Service } from 'egg';
import { createWriteStream } from 'fs';
import { GitArticleObjectType } from '../types/git';

export default class GithubService extends Service {
    async getMyInfoFromGit() {
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
                    }
                }
            `
        });
        let res = await this.ctx.curl(viewer.avatarUrl);

        if (res.status === 200) {
            /** 图片下载到本地 */
            const type = res.headers['content-type'].split('/')[1];
            let stream = createWriteStream(`app/public/avatar.${type}`);
            stream.write(res.data);
            viewer.avatarUrl = `public/avatar.${type}`;
        } else {
            this.ctx.logger.error(res);
        }
        await this.ctx.model.Users.upsert(viewer);

        return viewer;
    }
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
                                        object {
                                            id
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
     * @param  {string[]} input.assigneeIds  指派给谁(id) 当然肯定是我自己
     * @param  {string} input.body         issue 内容
     * @param  {string[]} input.labelIds     标签 id 代表 article 的标签肯定要加
     * @param  {string[]} input.projectIds   暂时不需要 但是必填
     * @param  {string} input.repositoryId 所在仓库的id
     * @param  {string} input.title        标题
     * @return              创建好的 Issue number
     */
    async createIssue (input: {
        assigneeIds: string[],
        body: string,
        labelIds: string[],
        projectIds: string[],
        repositoryId: string,
        title: string
    }): Promise<{number: number, id: string}> {
        let { createIssue: { issue: { number, id } } } = await this.ctx.helper.graph({
            query: `
                mutation($input: CreateIssueInput!) {
                    createIssue(input: $input) {
                        issue {
                            id
                            number
                        }
                    }
                }
            `,
            variables: {
                input
            }
        });

        return { number, id };
    }

    async updateIssue (body: string, title: string, number: number) {
        /** 先拿到 issue */
        let { viewer: { repository: { issue } } } = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $number: Int!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            issue (number: $number) {
                                id
                                labels(first: 10) {
                                    nodes {
                                        id
                                    }
                                }
                                assignees(first: 10) {
                                    nodes {
                                        id
                                    }
                                }
                                projectCards(first: 10) {
                                    nodes {
                                        id
                                    }
                                }
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

        const idMap = (item: {id: string}) => item.id;
        await this.ctx.helper.graph({
            query: `
                mutation($input: UpdateIssueInput!) {
                    updateIssue(input: $input) {
                        issue {
                            id
                        }
                    }
                }
            `,
            variables: {
                input: {
                    assigneeIds: issue.assignees.nodes.map(idMap),
                    labelIds: issue.labels.nodes.map(idMap),
                    projectIds: issue.projectCards.nodes.map(idMap),
                    id: issue.id,
                    title,
                    body
                }
            }
        });
    }

    async getLastAndFirstCommitDate(fileName: string): Promise<[Date, Date] | undefined> {
        let { BLOG_REPOSITORY, ARTICLES_PATH } = this.config.github;

        let {
            viewer: { repository: { defaultBranchRef: { target: {
                // history: { edges: [{ node: { pushedDate: lastPushedDate } }] },
                // last: { pageInfo: { endCursor } }
                history: { edges }
            } } } }
        } = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $path: String!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            defaultBranchRef {
                                target {
                                    ... on Commit {
                                        history(path: $path) {
                                            edges {
                                                node {
                                                    pushedDate
                                                }
                                            }
                                        }
                                        last: history(path: $path) {
                                            pageInfo {
                                                endCursor
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

        /** 通过 end游标获取第一次提交 */
        // let {
        //     viewer: { repository: { defaultBranchRef: { target: { history: {
        //         edges
        //     } } } } }
        // } = await this.ctx.helper.graph({
        //     query: `
        //         query($name_of_repository: String!, $path: String!, $endCursor: String!) {
        //             viewer {
        //                 repository (name: $name_of_repository) {
        //                     defaultBranchRef {
        //                         target {
        //                             ... on Commit {
        //                                 history(last: 1, path: $path, before: $endCursor) {
        //                                     edges {
        //                                         node {
        //                                             pushedDate
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     `,
        //     variables: {
        //         'name_of_repository': BLOG_REPOSITORY,
        //         path: `${ARTICLES_PATH}/${fileName}`,
        //         endCursor
        //     }
        // });
        //
        // if (edges.length < 1) {
        //     this.logger.error(`获取${fileName}的提交历史失败`);
        //     return;
        // }
        //
        // let [{ node: { pushedDate: firstPushedDate } }] = edges;

        if (edges.length < 1) {
            this.logger.error(`获取${fileName}的提交历史失败`);
            return;
        }

        let commitlist: string[] = [];

        edges.forEach(({ node: { pushedDate } }) => {
            pushedDate && commitlist.push(pushedDate);
        });

        return [new Date(commitlist[0]), new Date(commitlist[commitlist.length - 1])];
    }
    /**
     * 将文章和 Issue 关联起来
     * @param  fileName 文章的文件名字
     * @param  number   issue number
     */
    async associate(fileName: string, number: number) {
        let { ARTICLES_PATH, ARTICLE_REF } = this.config.github;

        // 先通过fileName获取 oid 并且通过number 获取 issue 的标题
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

        // 通过 fileName 查找数据库是否有记录该 fileName 的东西
        let fileData = await this.ctx.model.Articles.findOne({
            where: { fileName },
            attributes: [ 'id' ],
            raw: true
        });

        // 通过 issueNumber 查找数据库是否有记录该 issueNumber 的东西
        let issueData = await this.ctx.model.Articles.findOne({
            where: { issueNumber: number },
            attributes: [ 'id' ],
            raw: true
        });

        /*
        当都没有关联才可以进行关联
        正常情况下不会出现一个关联一个没有关联
         */
        if (fileData === null && issueData === null) {
            /** 拿到文件最后提交时间 */
            let dateList = await this.getLastAndFirstCommitDate(fileName);
            if (!dateList) throw new InternalServerError('无法获取提交信息');

            let [last, first] = dateList as Date[];

            /** 将关系存起来 */
            await this.ctx.model.Articles.create({
                fileName,
                oid: article.oid,
                issueId: issue.id,
                issueNumber: number,
                title: issue.title,
                publishedAt: first,
                issueUpdatedAt: last
            });
        }
    }
    /**
     * 通过 number 获得 Issue id
     * @param  number Issue 的 number
     * @return        id
     */
    async getIssueByNumber(number: number) {
        let { viewer: { repository: { issue } } } = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!, $number: Int!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            issue (number: $number) {
                                id
                                body
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

        return issue;
    }
}
