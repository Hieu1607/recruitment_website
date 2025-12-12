'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '../config/database.js'))[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });
}

// Auto-load all models
fs
    .readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file !== 'profile.js' &&
            file !== 'application.js'
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

// Register associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Define associations manually after all models are loaded
const Role = db.Role;
const User = db.User;
const UserProfile = db.UserProfile;
const Company = db.Company;
const Job = db.Job;
const JobApplication = db.JobApplication;

if (Role && User) {
    Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
}

if (User && UserProfile) {
    User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
    UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}

if (User && Company) {
    User.hasMany(Company, { foreignKey: 'user_id', as: 'companies' });
    Company.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}

if (Company && Job) {
    Company.hasMany(Job, { foreignKey: 'company_id', as: 'jobs' });
    Job.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
}

if (Job && JobApplication) {
    Job.hasMany(JobApplication, { foreignKey: 'job_id', as: 'applications' });
    JobApplication.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
}

if (User && JobApplication) {
    User.hasMany(JobApplication, { foreignKey: 'user_id', as: 'applications' });
    JobApplication.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
