import { Application } from 'egg';
import { baseModelData } from '../lib/utils/sequelizeDefaultOpt';

export default (app: Application) => {
    const Sequelize = app.Sequelize;

    let [ defaultAttr, defaultOpt ]: any = baseModelData(Sequelize);

    const Articles = app.model.define(
        'articles',
        {
            ...defaultAttr,
            oid: Sequelize.STRING,
            issueId: {
                type: Sequelize.UUID,
                unique: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
            },
            title: Sequelize.STRING,
            publishedAt: Sequelize.DATE,
            issueUpdatedAt: Sequelize.DATE,
            img: Sequelize.STRING
        },
        defaultOpt
    );

    return class extends Articles {};
};
