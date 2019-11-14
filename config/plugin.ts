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
    }
};

export default plugin;
