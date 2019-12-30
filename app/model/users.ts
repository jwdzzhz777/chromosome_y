import { Application } from 'egg';
import { baseModelData } from '../lib/utils/sequelizeDefaultOpt';

export default (app: Application) => {
    const sequelize = app.Sequelize;

    let defaultOpt: any = baseModelData(sequelize)[1];

    const Users = app.model.define(
        'users',
        {
            id: {
                unique: true,
                primaryKey: true,
                allowNull: false,
                type: sequelize.STRING
            },
            name: sequelize.STRING,
            login: sequelize.STRING,
            email: sequelize.STRING,
            bio: sequelize.STRING,
            avatarUrl: sequelize.STRING
        },
        defaultOpt
    );

    return class extends Users {};
};
