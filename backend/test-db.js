const { sequelize } = require('./src/models');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL successfully');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        process.exit(1);
    }
}

testConnection();

