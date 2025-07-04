import { jest } from '@jest/globals'; 
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

jest.setTimeout(20000); 

const testUser = {
  name: 'Test User',
  email: 'testuser1@example.com',
  password: 'test1234',
};

describe('🔐 Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI); 
    await mongoose.connection.db.collection('users').deleteOne({ email: testUser.email }); 
  });

  it('should register a user successfully (or detect duplicate)', async () => {
    const res = await request(app).post('/api/users/register').send(testUser);

    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.name).toBe(testUser.name);
    } else if (res.statusCode === 409) {
      expect(res.body.message).toMatch(/already exists/i);
    } else {
      throw new Error(`Unexpected status code: ${res.statusCode}`);
    }
  });

  it('should not allow duplicate email registration', async () => {
    const res = await request(app).post('/api/users/register').send(testUser);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should login the user', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(testUser.email);
  });

  afterAll(async () => {
    await mongoose.disconnect(); 
  });
});
