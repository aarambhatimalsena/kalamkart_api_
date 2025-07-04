import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

jest.setTimeout(20000);

let adminToken = '';
let userToken = '';
const adminEmail = 'adminuser@example.com';
const normalEmail = 'normaluser@example.com';

describe('🛡️ Admin Access Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteOne({ email: adminEmail });
    await User.deleteOne({ email: normalEmail });

    const adminRes = await request(app).post('/api/users/register').send({
      name: 'Admin Test',
      email: adminEmail,
      password: 'admin123',
    });
    adminToken = adminRes.body.token;

    await User.updateOne({ email: adminEmail }, { $set: { role: 'admin' } });

    const userRes = await request(app).post('/api/users/register').send({
      name: 'Normal Test',
      email: normalEmail,
      password: 'user123',
    });
    userToken = userRes.body.token;
  });

  test('✅ Admin can access /api/admin/users with token', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // ✅ Fix: expect array
  });

  test('❌ Access without token should fail', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  test('❌ Normal user should not access admin route', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message.toLowerCase()).toMatch(/admin|access denied/); // ✅ flexible match
  });

  // NEW: Admin can access all reviews
  test('✅ Admin can access /api/admin/reviews', async () => {
    const res = await request(app)
      .get('/api/admin/reviews')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // NEW: Admin can access all orders
  test('✅ Admin can access /api/admin/orders', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
});
