'use strict';
const defaultOptions = require('../defaultOption');

module.exports = {
    up: (queryInterface, Sequelize) => {
        const [defaultAttr, defaultOpt] = defaultOptions(Sequelize);
        return queryInterface.createTable(
            'users',
            {
                ...defaultAttr,
                id: {
                    type: Sequelize.STRING,
                    unique: true,
                    primaryKey: true,
                    allowNull: false
                },
                u_id: Sequelize.STRING,
                name: Sequelize.STRING,
                login: Sequelize.STRING,
                email: Sequelize.STRING,
                bio: Sequelize.STRING,
                avatar_url: Sequelize.STRING
            },
            defaultOpt
        );
    },
    down: queryInterface => queryInterface.dropTable('users')
};
