'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filePath = path.resolve(__dirname, 'jobs.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const jobs = JSON.parse(raw);
    // Data is pre-normalized by generate_jobs_from_data.js
    await queryInterface.bulkInsert('jobs', jobs, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('jobs', null, {});
  },
};
