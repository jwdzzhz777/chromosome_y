'use strict';
const defaultOptions = require('../defaultOption');

module.exports = {
    up: (queryInterface, Sequelize) => {
        const [defaultAttr, defaultOpt] = defaultOptions(Sequelize);
        return queryInterface.createTable(
            'articles',
            {
                ...defaultAttr,
                oid: {
                    type: Sequelize.UUID,
                    unique: true,
                    allowNull: false,
                    defaultValue: Sequelize.UUIDV4,
                },
                issueId: {
                    type: Sequelize.UUID,
                    unique: true,
                    allowNull: false,
                    defaultValue: Sequelize.UUIDV4,
                },
                title: Sequelize.STRING,
                publishedAt: Sequelize.DATE,
                updatedAt: Sequelize.DATE,
                img: Sequelize.STRING
            },
            defaultOpt
        );
    },
    down: queryInterface => queryInterface.dropTable('articles')
};
