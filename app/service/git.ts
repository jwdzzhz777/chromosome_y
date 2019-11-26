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
        /** 先拿到文章文件的信息 */
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

    async createIssue (
        assigneeIds: string,
        body: string,
        labelIds: string[],
        projectIds: string[],
        repositoryId: string,
        title: string
    ) {

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
        console.log(new Date(pushedDate));
        return new Date(pushedDate);
    }
    async getIssues() {
        let data = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            issues (labels: ["article"], first: 10) {
                                nodes {
                                    id
                                    title
                                    publishedAt
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                'name_of_repository': this.config.github.BLOG_REPOSITORY,
            }
        });

        return data;
    }
    async getBlogLabels() {
        let data = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!) {
                    viewer {
                        repository (name: $name_of_repository) {
                            labels (first: 10, query: "article") {
                                nodes {
                                    issues (first: 10) {
                                        nodes {
                                            title
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                'name_of_repository': this.config.github.BLOG_REPOSITORY
            }
        });

        return data;
    }
}
