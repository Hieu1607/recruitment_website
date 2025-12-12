'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('jobs', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            companyId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                field: 'companyId',
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
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
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

