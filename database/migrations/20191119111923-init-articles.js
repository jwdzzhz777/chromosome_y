'use strict';
const defaultOptions = require('../defaultOption');

module.exports = {
    up: (queryInterface, Sequelize) => {
        const [defaultAttr, defaultOpt] = defaultOptions(Sequelize);
        return queryInterface.createTable(
            'articles',
            {
                ...defaultAttr,
                oid: Sequelize.STRING,
                issue_id: {
                    type: Sequelize.UUID,
                    unique: true,
                    allowNull: false,
                    defaultValue: Sequelize.UUIDV4,
                },
                title: Sequelize.STRING,
                published_at: Sequelize.DATE,
                issue_updated_at: Sequelize.DATE,
                img: Sequelize.STRING
            },
            defaultOpt
        );
    },
    down: queryInterface => queryInterface.dropTable('articles')
};
