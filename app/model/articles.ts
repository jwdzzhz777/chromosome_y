import { Application } from 'egg';
import { baseModelData } from '../lib/utils/sequelizeDefaultOpt';

export default (app: Application) => {
    const sequelize = app.Sequelize;

    let [ defaultAttr, defaultOpt ]: any = baseModelData(sequelize);

    const Articles = app.model.define(
        'articles',
        {
            ...defaultAttr,
            /** fileName 作为文件的唯一标示 */
            fileName: sequelize.STRING,
            /** 随着提交 oid 会一直变化，不适合做唯一标示 */
            oid: sequelize.STRING,
            issueId: {
                type: sequelize.UUID,
                unique: true,
                allowNull: false,
                defaultValue: sequelize.UUIDV4,
            },
            /** issueNumner 作为 Issue 的唯一表示 */
            issueNumber: sequelize.INTEGER,
            title: sequelize.STRING,
            publishedAt: {
                type: sequelize.DATE,
                get(this: any) {
                    return +this.getDataValue('publishedAt');
                }
            },
            issueUpdatedAt: {
                type: sequelize.DATE,
                get(this: any) {
                    return +this.getDataValue('issueUpdatedAt');
                }
            },
            img: sequelize.STRING
        },
        defaultOpt
    );

    return class extends Articles {};
};
