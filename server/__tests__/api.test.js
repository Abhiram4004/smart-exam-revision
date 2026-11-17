const request = require('supertest');
const app = require('../server');

describe('REST API Endpoint Tests', () => {
  test('GET /api/health returns 200 OK with status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  test('POST /api/auth/login with missing payload returns 400 validation error', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/register with short password returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'validemail@test.com',
      password: '123' // Less than 6 characters
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('Protected endpoint without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});

