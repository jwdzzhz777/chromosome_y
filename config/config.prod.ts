import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
    const config: PowerPartial<EggAppConfig> = {};

    config.bizConfig.github.ACCESS_TOKEN = '55b190583ee620c1c1e7615062414dec3eebb839';
    config.sequelize = {
        dialect: 'mysql',
        username: 'jiawendi',
        password: '0124578',
        host: '127.0.0.1',
        port: 3306,
        database: 'blog',
    };

    return config;
};
