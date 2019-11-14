import { Controller } from 'egg';
import { Api, path, desc, response } from '@jwdzzhz777/egg-genome';

@Api
export default class HomeController extends Controller {
    @path('/')
    @desc('test')
    @response({
        aaa: 'test'
    })
    public async index() {
        const { ctx, config: { github } } = this;

        try {
            let { data: { data, errors } } = await ctx.curl(github.API, {
                headers: {
                    Authorization: `Bearer ${github.ACCESS_TOKEN}`
                },
                method: 'POST',
                dataType: 'json',
                contentType: 'json',
                data: JSON.stringify({
                    query: `
                        query($name_of_repository: String!) {
                            viewer {
                                id
                                name
                                login
                                email
                                repository (name: $name_of_repository) {
                                    name
                                }
                            }
                        }
                    `,
                    variables: {
                        'name_of_repository': 'web-test-zhihu'
                    }
                })
            });

            if (errors) throw new Error(errors.reduce((total: string, current: { message: string }, index: number) => `${total} ${index + 1}. ${current.message}`, ''));

            let { viewer } = data;
            console.log(viewer);
        } catch (e) {
            console.log(e);
        }
    }
}
