import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

let token;
let productId;
let categoryId;
const uniqueCategoryName = `TestCategory-${Date.now()}`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
  await User.deleteMany({ email: 'admin@example.com' });
  await Category.deleteOne({ name: uniqueCategoryName }); 

  // Create admin user
  await request(app).post('/api/users/register').send({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
  });
  await User.findOneAndUpdate({ email: 'admin@example.com' }, { role: 'admin' });

  const loginRes = await request(app).post('/api/users/login').send({
    email: 'admin@example.com',
    password: 'admin123',
  });
  token = loginRes.body.token;

  const cat = await Category.create({ name: uniqueCategoryName });
  categoryId = cat._id;
});

afterAll(async () => {
  await Category.deleteOne({ name: uniqueCategoryName }); 
  await mongoose.disconnect();
});

describe('📦 Product API Tests (Admin)', () => {
  test('✅ Admin can add a product', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test Product')
      .field('description', 'A test product')
      .field('price', 99)
      .field('stock', 10)
      .field('category', categoryId.toString())
      .field('image', 'https://res.cloudinary.com/djv58awy8/image/upload/v1750755328/kalamkart-products/wyy2gruyz16jvxkm2wav.jpg');

    console.log('📦 Product create response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Product');
    productId = res.body._id;
  });

  test('✅ Can get single product by ID', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(productId);
  });

  test('✅ Admin can update product', async () => {
    const res = await request(app)
      .put(`/api/products/admin/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('price', 149);

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(149);
  });

  test('✅ Admin can delete product', async () => {
    const res = await request(app)
      .delete(`/api/products/admin/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message.toLowerCase()).toMatch(/deleted/);
  });
});
