module.exports = (sequelize, DataTypes) => {
    const UserProfile = sequelize.define(
        'UserProfile',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            full_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            dob: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            skills: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            experience: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            education: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            avatar_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            cv_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'user_profiles',
            timestamps: false,
            underscored: true,
        }
    );

    return UserProfile;
};

