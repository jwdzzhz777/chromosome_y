import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
    const config: PowerPartial<EggAppConfig> = {};

    config.sequelize = {
        dialect: 'mysql',
        username: 'root',
        password: 'password',
        host: '127.0.0.1',
        port: 3306,
        database: 'blog',
    };

    config.cors = {
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS'
    }

    return config;

};
