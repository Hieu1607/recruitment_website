'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('user_profiles', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            full_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            dob: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            skills: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            experience: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            education: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            avatar_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            cv_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('user_profiles');
    },
};

