'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('companies', [
      {
        name: 'Tech Corp Vietnam',
        description: 'Leading technology company in Vietnam',
        size: 'Large',
        type: 'IT/Software',
        address: 'Ho Chi Minh City',
        website: 'https://techcorp.vn',
        phone: '0123456789',
        email: 'contact@techcorp.vn',
      },
      {
        name: 'Innovation Hub',
        description: 'Startup focused on AI and Machine Learning',
        size: 'Medium',
        type: 'Startup',
        address: 'Hanoi',
        website: 'https://innovationhub.vn',
        phone: '0987654321',
        email: 'hello@innovationhub.vn',
      },
      {
        name: 'Digital Solutions',
        description: 'Web and mobile development agency',
        size: 'Small',
        type: 'Agency',
        address: 'Da Nang',
        website: 'https://digitalsolutions.vn',
        phone: '0912345678',
        email: 'info@digitalsolutions.vn',
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('companies', null, {});
  },
};
