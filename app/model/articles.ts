import { Application } from 'egg';
import { baseModelData } from '../lib/utils/sequelizeDefaultOpt';

export default (app: Application) => {
    const Sequelize = app.Sequelize;

    let [ defaultAttr, defaultOpt ]: any = baseModelData(Sequelize);

    const Articles = app.model.define(
        'articles',
        {
            ...defaultAttr,
            /** fileName 作为文件的唯一标示 */
            fileName: Sequelize.STRING,
            /** 随着提交 oid 会一直变化，不适合做唯一标示 */
            oid: Sequelize.STRING,
            issueId: {
                type: Sequelize.UUID,
                unique: true,
                allowNull: false,
                defaultValue: Sequelize.UUIDV4,
            },
            /** issueNumner 作为 Issue 的唯一表示 */
            issueNumber: Sequelize.INTEGER,
            title: Sequelize.STRING,
            publishedAt: Sequelize.DATE,
            issueUpdatedAt: Sequelize.DATE,
            img: Sequelize.STRING
        },
        defaultOpt
    );

    return class extends Articles {};
};
