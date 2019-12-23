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

    return config;

};
