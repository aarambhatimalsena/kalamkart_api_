import mongoose from 'mongoose';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

const __dirname = path.resolve();
let token;
let createdCategoryId;
const uniqueCategoryName = `TestCategory-${Date.now()}`; 

describe('📂 Category API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/kalamkart_test');
    await User.deleteMany({ email: 'category@example.com' });
    await Category.deleteMany({ name: new RegExp('TestCategory') }); // 🔁 Clean any previous test data

    await request(app).post('/api/users/register').send({
      name: 'Category Tester',
      email: 'category@example.com',
      password: 'test1234',
    });

    await User.findOneAndUpdate({ email: 'category@example.com' }, { role: 'admin' });

    const loginRes = await request(app).post('/api/users/login').send({
      email: 'category@example.com',
      password: 'test1234',
    });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await Category.deleteMany({ name: new RegExp('TestCategory') }); 
    await mongoose.disconnect();
  });

  test('✅ should create a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .field('name', uniqueCategoryName)
      .attach('image', fs.readFileSync(path.join(__dirname, 'tests', 'dummy.jpg')), 'dummy.jpg');

    expect(res.statusCode).toBe(201);
    expect(res.body.category.name).toBe(uniqueCategoryName);
    createdCategoryId = res.body.category._id;
  });

  test('📥 should fetch all categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('❌ should delete the created category', async () => {
    if (!createdCategoryId) return;
    const res = await request(app)
      .delete(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message.toLowerCase()).toMatch(/deleted/i);
  });
});
