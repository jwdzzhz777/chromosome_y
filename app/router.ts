import { Application } from 'egg';

export default (app: Application) => {
    const { controller, router }=app;

    router.get('/api/github/fetch', controller.git.fetch);
    router.get('/api/user/viewer', controller.git.getViewer);
    
    router.get('/api/article/list', controller.article.getArticleList);
    router.get('/api/article/context', controller.article.getArticle);

    router.get('/api/test/associate', controller.test.associate);
};
