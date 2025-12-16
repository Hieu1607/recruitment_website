const request = require('supertest');
const app = require('../src/app');

async function getAuthToken() {
  const res = await request(app)
    .post('/api/v1/login')
    .send({ email: 'admin@example.com', password: 'password' });
  return res.body?.data?.token;
}

describe('UserProfile API', () => {
  test('Get my profile requires auth', async () => {
    const res = await request(app).get('/api/v1/profiles/me');
    expect([401, 403]).toContain(res.status);
  });

  test('Update profile requires auth', async () => {
    const res = await request(app)
      .put('/api/v1/profiles/me')
      .send({ full_name: 'Test User' });
    expect([401, 403]).toContain(res.status);
  });

  test('Validation errors are returned for update', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/api/v1/profiles/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar_url: 'not-a-valid-url' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  test('Get profile by user ID works', async () => {
    const res = await request(app).get('/api/v1/profiles/1');
    // Could be 200 or 404 depending on if profile exists
    expect([200, 404]).toContain(res.status);
  });
});
