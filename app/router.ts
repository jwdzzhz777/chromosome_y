import { Application } from 'egg';

export default (app: Application) => {
    const { controller, router }=app;

    router.get('/api/github/getBlogRepo', controller.git.blogRepo);

    router.get('/api/user/viewer', controller.user.getViewr);

    router.get('/api/test/associate', controller.git.associate);
};
