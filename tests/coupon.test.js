import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';

let adminToken = '';
const dynamicCode = `TEST${Date.now()}`; 

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/kalamkart_test');

  // Clean up test user and test coupons
  await User.deleteMany({ email: /admincoupon/i });
  await Coupon.deleteMany({ code: new RegExp('TEST') });

  // Create an admin user
  await request(app).post('/api/users/register').send({
    name: 'Admin Coupon',
    email: 'admincoupon@example.com',
    password: 'admin123',
  });

  await User.findOneAndUpdate({ email: 'admincoupon@example.com' }, { role: 'admin' });

  const loginRes = await request(app).post('/api/users/login').send({
    email: 'admincoupon@example.com',
    password: 'admin123',
  });

  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('🎟️ Coupon API Tests', () => {
  test('✅ should create a new coupon (admin only)', async () => {
    const res = await request(app)
      .post('/api/coupons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: dynamicCode,
        discountPercentage: 10,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.code).toBe(dynamicCode);
  });

  test('📥 should fetch and validate a coupon by code', async () => {
    const res = await request(app).get(`/api/coupons/${dynamicCode}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.discountPercentage).toBe(10);
  });

  test('📦 should fetch all coupons (admin only)', async () => {
    const res = await request(app)
      .get('/api/coupons')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('❌ should delete the coupon (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/coupons/${dynamicCode}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });
});
