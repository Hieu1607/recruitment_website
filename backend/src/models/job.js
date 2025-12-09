module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define(
        'Job',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            company_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id',
                },
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            level: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            salary: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            location: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            deadline: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            requirements: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            benefits: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'jobs',
            timestamps: false,
            underscored: true,
        }
    );

    return Job;
};
