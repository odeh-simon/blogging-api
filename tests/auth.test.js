const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');


beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URL);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth API', () => {
  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('john@example.com');
  });

  it('should signin an existing user', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'jane@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('jane@example.com');
  });

  it('should not signin with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'jane@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Incorrect email or password');
  });
});