'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('jobs', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            company_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                field: 'company_id',
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            level: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            salary: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            location: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            deadline: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            requirements: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            benefits: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'active',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('jobs');
    },
};

