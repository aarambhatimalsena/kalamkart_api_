import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

let token;
let productId;
let categoryId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
  await User.deleteMany({ email: 'wishlistuser@example.com' });
  await Category.deleteMany({ name: 'TestCategory' });
  await Product.deleteMany({ name: 'Wishlist Product' });

  // Register test user
  await request(app).post('/api/users/register').send({
    name: 'Wishlist User',
    email: 'wishlistuser@example.com',
    password: 'test1234',
  });

  const loginRes = await request(app).post('/api/users/login').send({
    email: 'wishlistuser@example.com',
    password: 'test1234',
  });

  token = loginRes.body.token;

  // Create category
  const cat = await Category.create({ name: 'TestCategory' });
  categoryId = cat._id;

  // Create product manually
  const product = await Product.create({
    name: 'Wishlist Product',
    description: 'For wishlist test',
    price: 49,
    stock: 10,
    category: categoryId,
    image:
      'https://res.cloudinary.com/djv58awy8/image/upload/v1750755328/kalamkart-products/wyy2gruyz16jvxkm2wav.jpg',
    createdBy: loginRes.body.user?._id || undefined,
  });

  productId = product._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('💖 Wishlist API Tests', () => {
  test('✅ should add a product to the wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ productIds: [productId] }); // ✅ controller expects array

    console.log('📩 Add to wishlist response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/added/i);
  });

  test('📥 should retrieve the wishlist', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const exists = res.body.find(
      (item) => item.product && item.product._id === productId
    );

    expect(exists).toBeDefined();
  });

  test('❌ should remove the product from the wishlist', async () => {
    const res = await request(app)
      .delete(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });
});
