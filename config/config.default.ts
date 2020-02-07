import { EggAppConfig, EggAppInfo, PowerPartial, Context } from 'egg';

export default (appInfo: EggAppInfo) => {
    const config={} as PowerPartial<EggAppConfig>;

    // override config from framework / plugin
    // use for cookie sign key, should change to your own and keep security
    config.keys=appInfo.name+'_1573208286292_6599';

    // add your egg config in here
    config.middleware=[];

    // add your special config in here
    const bizConfig={
        sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
        github: {
            API: 'https://api.github.com/graphql',
            ACCESS_TOKEN: '53c9b4981185b68b1bd77280ff1c3480c87e120a',
            BLOG_REPOSITORY: 'blog',
            ARTICLES_PATH: 'articles',
            ARTICLE_LABEL: 'article',
            ARTICLE_REF: 'master'
        }
    };

    config.onerror = {
        json(err: any, ctx: Context) {
            ctx.logger.error(err);
            ctx.type = 'json';
            ctx.body = {
                success: false,
                code: err.status || err.statusCode,
                msg: err.message,
                err
            };
        }
    };

    config.middleware = [
        'respones',
    ];

    config.cors = {
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
    }

    // the return config will combines to EggAppConfig
    return {
        ...config,
        ...bizConfig
    };
};
