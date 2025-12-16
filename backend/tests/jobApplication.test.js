const request = require('supertest');
const app = require('../src/app');

async function getAuthToken() {
  const res = await request(app)
    .post('/api/v1/login')
    .send({ email: 'admin@example.com', password: 'password' });
  return res.body?.data?.token;
}

describe('JobApplication API', () => {
  test('Apply for job requires auth', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .send({ job_id: 1 });
    expect([401, 403]).toContain(res.status);
  });

  test('List my applications requires auth', async () => {
    const res = await request(app).get('/api/v1/applications/my-applications');
    expect([401, 403]).toContain(res.status);
  });

  test('Validation errors on apply', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ job_id: -1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  test('Update status requires valid status', async () => {
    const token = await getAuthToken();
    const res = await request(app)
      .put('/api/v1/applications/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid_status' });
    expect(res.status).toBe(400);
  });

  test('Get application by ID (public)', async () => {
    const res = await request(app).get('/api/v1/applications/1');
    // Could be 200 or 404
    expect([200, 404]).toContain(res.status);
  });
});
