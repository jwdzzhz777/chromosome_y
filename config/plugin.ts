import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
    // static: true,
    nunjucks: {
        enable: true,
        package: 'egg-view-nunjucks'
    },
    genome: {
        enable: true,
        package: '@jwdzzhz777/egg-genome'
    },
    sequelize: {
        enable: true,
        package: 'egg-sequelize'
    },
    validate: {
        enable: true,
        package: 'egg-validate',
    },
    cors: {
        enable: true,
        package: 'egg-cors'
    }
};

export default plugin;
