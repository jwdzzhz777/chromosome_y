import { Service } from 'egg';

export default class GithubService extends Service {
    async getRepositoryFileList(name: string) {
        let data = await this.ctx.helper.graph({
            query: `
                query($name_of_repository: String!) {
                    viewer {
                        id
                        name
                        login
                        email
                        repository (name: $name_of_repository) {
                            name
                            readme: object (expression: "master:") {
                                ... on Tree {
                                    entries {
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
                'name_of_repository': name
            }
        });
        return data;
    }
}
