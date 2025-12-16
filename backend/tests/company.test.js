/**
 * Company CRUD Tests
 * Testing: Create, Read, Update, Delete operations for Company
 * Run with: npm test (after adding test framework)
 */

const request = require('supertest');
const app = require('../src/app');
const { Company, User } = require('../src/models');

describe('Company CRUD Operations', () => {
  let authToken;
  let testUserId;
  let testCompanyId;

  // Setup: Create test user and get auth token
  beforeAll(async () => {
    // Create test user for company owner
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testcompany@example.com',
        password: 'Test123!',
        fullName: 'Test Company Owner',
        roleId: 2, // employer role
      });
    
    testUserId = userResponse.body.data.userId;
    
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testcompany@example.com',
        password: 'Test123!',
      });
    
    authToken = loginResponse.body.data.token;
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Delete test company
    if (testCompanyId) {
      await Company.destroy({ where: { id: testCompanyId } });
    }
    // Delete test user
    if (testUserId) {
      await User.destroy({ where: { id: testUserId } });
    }
  });

  describe('POST /api/companies - Create Company', () => {
    test('should create a new company with valid data', async () => {
      const companyData = {
        name: 'Test Tech Company',
        description: 'A leading technology company',
        size: '100-499',
        type: 'IT/Software',
        address: 'Hanoi, Vietnam',
        website: 'https://testtech.vn',
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(companyData.name);
      expect(response.body.data.user_id).toBe(testUserId);
      
      testCompanyId = response.body.data.id;
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({ name: 'Test Company' });

      expect(response.status).toBe(401);
    });

    test('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No name provided' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid data types', async () => {
      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 123, // should be string
          size: ['invalid'],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/companies - Get All Companies', () => {
    test('should get list of companies', async () => {
      const response = await request(app).get('/api/companies');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/companies')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body).toHaveProperty('pagination');
    });

    test('should support search by name', async () => {
      const response = await request(app)
        .get('/api/companies')
        .query({ search: 'Tech' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/companies/:id - Get Company by ID', () => {
    test('should get company details by id', async () => {
      const response = await request(app).get(`/api/companies/${testCompanyId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCompanyId);
      expect(response.body.data.name).toBe('Test Tech Company');
    });

    test('should return 404 for non-existent company', async () => {
      const response = await request(app).get('/api/companies/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid id format', async () => {
      const response = await request(app).get('/api/companies/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/companies/:id - Update Company', () => {
    test('should update company with valid data', async () => {
      const updateData = {
        name: 'Updated Tech Company',
        description: 'Updated description',
        size: '500-999',
      };

      const response = await request(app)
        .put(`/api/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.size).toBe(updateData.size);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/companies/${testCompanyId}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(401);
    });

    test('should fail when updating another users company', async () => {
      // Create another user
      const otherUser = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          password: 'Test123!',
          fullName: 'Other User',
          roleId: 2,
        });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'other@example.com', password: 'Test123!' });

      const response = await request(app)
        .put(`/api/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${otherLogin.body.data.token}`)
        .send({ name: 'Hacked Company' });

      expect(response.status).toBe(403);
    });

    test('should return 404 for non-existent company', async () => {
      const response = await request(app)
        .put('/api/companies/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Not Found' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/companies/:id - Delete Company', () => {
    test('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/companies/${testCompanyId}`);

      expect(response.status).toBe(401);
    });

    test('should fail when deleting another users company', async () => {
      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'other@example.com', password: 'Test123!' });

      const response = await request(app)
        .delete(`/api/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${otherLogin.body.data.token}`);

      expect(response.status).toBe(403);
    });

    test('should delete company successfully', async () => {
      const response = await request(app)
        .delete(`/api/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion
      const getResponse = await request(app).get(`/api/companies/${testCompanyId}`);
      expect(getResponse.status).toBe(404);
    });

    test('should return 404 for non-existent company', async () => {
      const response = await request(app)
        .delete('/api/companies/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/companies/my - Get My Company', () => {
    test('should get authenticated users company', async () => {
      // Create a new company for this test
      await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Company',
          description: 'My company desc',
        });

      const response = await request(app)
        .get('/api/companies/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user_id).toBe(testUserId);
    });

    test('should fail without authentication', async () => {
      const response = await request(app).get('/api/companies/my');

      expect(response.status).toBe(401);
    });

    test('should return 404 if user has no company', async () => {
      // Create user without company
      const noCompanyUser = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'nocompany@example.com',
          password: 'Test123!',
          fullName: 'No Company User',
          roleId: 2,
        });

      const noCompanyLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nocompany@example.com', password: 'Test123!' });

      const response = await request(app)
        .get('/api/companies/my')
        .set('Authorization', `Bearer ${noCompanyLogin.body.data.token}`);

      expect(response.status).toBe(404);
    });
  });
});
