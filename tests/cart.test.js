import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

let token;
let productId;
let categoryId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  await Cart.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({ email: /cartuser/ });
  await Category.deleteMany({ name: 'CartCategory' });

  const category = await Category.create({ name: 'CartCategory' });
  categoryId = category._id;

  const userRes = await request(app).post('/api/users/register').send({
    name: 'Cart Tester',
    email: `cartuser@example.com`,
    password: 'test1234',
  });

  await User.findOneAndUpdate({ email: 'cartuser@example.com' }, { role: 'admin' });

  const loginRes = await request(app).post('/api/users/login').send({
    email: 'cartuser@example.com',
    password: 'test1234',
  });

  token = loginRes.body.token;

  const productRes = await request(app)
    .post('/api/products/admin')
    .set('Authorization', `Bearer ${token}`)
    .field('name', 'Notebook Test')
    .field('description', 'Test notebook')
    .field('price', 50)
    .field('stock', 10)
    .field('category', categoryId.toString());

  expect(productRes.statusCode).toBe(201);
  productId = productRes.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('🛒 Cart API Tests', () => {
  it('✅ should add item to cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 });

    const items = res.body.items || res.body.cart?.items || [];
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('📥 should retrieve cart items', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    const items = res.body.items || res.body.cart?.items || [];
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(items)).toBe(true);
  });

  it('✏️ should update cart item quantity', async () => {
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    const item = cartRes.body.items?.[0] || cartRes.body.cart?.items?.[0];
    if (!item || !item.product) return;

    const res = await request(app)
      .put('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: item.product._id,
        quantity: 5,
      });

    const updatedItems = res.body.items || res.body.cart?.items || [];
    const updatedItem = updatedItems.find(i => i.product._id === item.product._id);

    expect(res.statusCode).toBe(200);
    expect(updatedItem.quantity).toBe(5);
  });

  it('❌ should remove item from cart', async () => {
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    const item = cartRes.body.items?.[0] || cartRes.body.cart?.items?.[0];
    if (!item?._id) return;

    const res = await request(app)
      .delete(`/api/cart/${item._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message?.toLowerCase()).toMatch(/removed|deleted|success/);
  });
});
