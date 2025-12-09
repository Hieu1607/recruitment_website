module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password_hash: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id',
                },
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'users',
            timestamps: false,
            underscored: true,
        }
    );

    // Association will be defined in models/index.js
    // User.belongsTo(Role, { foreignKey: 'role_id' });

    return User;
};
