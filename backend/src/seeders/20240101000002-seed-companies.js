'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filePath = path.resolve(__dirname, 'companies.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const companies = JSON.parse(raw);
    await queryInterface.bulkInsert('companies', companies, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('companies', null, {});
  },
};
