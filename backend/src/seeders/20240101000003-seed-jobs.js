'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('jobs', [
      {
        title: 'Senior Node.js Developer',
        description: 'We are looking for an experienced Node.js developer to join our team',
        requirements: 'Experience with Node.js, Express, PostgreSQL. 5+ years experience required',
        level: 'Senior',
        salary: '40-60 triệu VND',
        location: 'Ho Chi Minh City',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        companyId: 1,
        status: 'active',
      },
      {
        title: 'Junior React Developer',
        description: 'Join our team as a Junior React Developer and grow your skills',
        requirements: 'Basic knowledge of React, JavaScript, HTML/CSS. Recent graduates welcome',
        level: 'Junior',
        salary: '15-25 triệu VND',
        location: 'Hanoi',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        companyId: 2,
        status: 'active',
      },
      {
        title: 'Full Stack Developer',
        description: 'Develop web applications using modern tech stack',
        requirements: 'Experience with React, Node.js, MongoDB. 3+ years experience',
        level: 'Mid-level',
        salary: '30-45 triệu VND',
        location: 'Da Nang',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        companyId: 3,
        status: 'active',
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('jobs', null, {});
  },
};
