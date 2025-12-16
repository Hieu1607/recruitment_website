const request = require('supertest');
const app = require('../src/app');

// Helper to get auth token if needed; adjust according to app setup
async function getAuthToken() {
  // Assuming there is a seeded user with email/password
  const res = await request(app)
    .post('/api/login')
    .send({ email: 'admin@example.com', password: 'password' });
  return res.body?.data?.token;
}

describe('Job API', () => {
  test('List jobs (public)', async () => {
    const res = await request(app).get('/api/jobs?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Create job requires auth', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ company_id: 1, title: 'New Job' });
    expect([401,403]).toContain(res.status);
  });

  test('Validation errors are returned', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ company_id: -1, title: '' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });
});
