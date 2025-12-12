module.exports = (sequelize, DataTypes) => {
    const JobApplication = sequelize.define(
        'JobApplication',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            job_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'jobs',
                    key: 'id',
                },
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'job_applications',
            timestamps: false,
            underscored: true,
        }
    );

    return JobApplication;
};

