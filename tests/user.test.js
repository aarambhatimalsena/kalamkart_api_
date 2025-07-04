import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
let token = '';
let userId = '';
let resetToken = '';
const email = `user_${Date.now()}@test.com`;
const password = 'test1234';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/kalamkart_test');
  await User.deleteMany({ email: new RegExp('user_') });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('👤 User API Tests', () => {
  test('✅ Register user', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'Test User',
      email,
      password,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    userId = res.body._id;
  });

  test('❌ Duplicate email registration should fail', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'Test User',
      email,
      password,
    });
    expect(res.statusCode).toBe(409);
  });

  test('✅ Login user', async () => {
    const res = await request(app).post('/api/users/login').send({
      email,
      password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('❌ Wrong password should fail login', async () => {
    const res = await request(app).post('/api/users/login').send({
      email,
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(401);
  });

  test('✅ Get profile (protected)', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(email);
  });

  test('✅ Update profile (name/email)', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated User' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated User');
  });

  test('✅ Forgot password (generates token)', async () => {
    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({ email });

    expect(res.statusCode).toBe(200);

    const user = await User.findOne({ email });
    expect(user.resetPasswordToken).toBeDefined();
    resetToken = jwt.sign({ token: user.resetPasswordToken }, 'dummy'); 
  },
   10000
  );

  test('✅ Reset password with token (simulated)', async () => {
    const user = await User.findOne({ email });

    const validToken = crypto
      .createHash('sha256')
      .update('testresettoken')
      .digest('hex');

    user.resetPasswordToken = validToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const res = await request(app)
      .post(`/api/users/reset-password/testresettoken`)
      .send({ password: 'newpass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/successful/i);
  });
});
