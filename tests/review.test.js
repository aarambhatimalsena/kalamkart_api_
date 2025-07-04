import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

let token, adminToken, productId, reviewId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  await User.deleteMany({ email: /reviewtest/ });
  await Category.deleteMany({ name: /TestCategory/ });
  await Product.deleteMany({ name: /Review Product/ });

  // Create category
  const category = await Category.create({ name: `TestCategory-${Date.now()}` });

  // Create product with category name, not ID (as per your code)
  const product = await Product.create({
    name: 'Review Product',
    description: 'For review tests',
    category: category.name,
    price: 50,
    stock: 10,
  });
  productId = product._id.toString();
  console.log('Created productId:', productId);

  // Register normal user
  await request(app).post('/api/users/register').send({
    name: 'Review Tester',
    email: `reviewtestuser@example.com`,
    password: 'test1234',
  });

  // Login normal user
  const loginRes = await request(app).post('/api/users/login').send({
    email: 'reviewtestuser@example.com',
    password: 'test1234',
  });
  token = loginRes.body.token;

  // Register admin user
  await request(app).post('/api/users/register').send({
    name: 'Admin Reviewer',
    email: `reviewtestadmin@example.com`,
    password: 'admin123',
  });
  await User.findOneAndUpdate({ email: 'reviewtestadmin@example.com' }, { role: 'admin' });

  // Login admin
  const adminLogin = await request(app).post('/api/users/login').send({
    email: 'reviewtestadmin@example.com',
    password: 'admin123',
  });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: /reviewtest/ });
  await Category.deleteMany({ name: /TestCategory/ });
  await Product.deleteMany({ name: /Review Product/ });
  await mongoose.disconnect();
});

describe('📝 Product Review API', () => {
  test('✅ Add review to product', async () => {
    const res = await request(app)
      .post(`/api/reviews/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Great product!' });
    console.log('Add review response status:', res.statusCode);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/review added/i);
  });

  test('📥 Get reviews for a product', async () => {
    const res = await request(app).get(`/api/reviews/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    reviewId = res.body[0]._id;
  });

  test('❌ Prevent duplicate review from same user', async () => {
    const res = await request(app)
      .post(`/api/reviews/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Trying second review' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  test('🧹 Delete review (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/reviews/${productId}/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/review deleted/i);
  });
});
