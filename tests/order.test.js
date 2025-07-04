import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

let token;
let productId;
let orderId;

const uniqueEmail = `orderuser_${Date.now()}@example.com`;
const categoryName = `TestCategory-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/kalamkart_test');

  // Clean old test data
  await User.deleteMany({ email: new RegExp('orderuser') });
  await Category.deleteMany({ name: new RegExp('TestCategory') });
  await Product.deleteMany({ name: new RegExp('Order Product') });

  // Register and login user
  await request(app).post('/api/users/register').send({
    name: 'Order User',
    email: uniqueEmail,
    password: 'order123',
  });

  const loginRes = await request(app).post('/api/users/login').send({
    email: uniqueEmail,
    password: 'order123',
  });

  token = loginRes.body.token;

  // Create category and product
  const cat = await Category.create({ name: categoryName });

  const product = await Product.create({
    name: 'Order Product',
    description: 'For order test',
    price: 100,
    stock: 10,
    category: cat._id,
    image:
      'https://res.cloudinary.com/djv58awy8/image/upload/v1750755328/kalamkart-products/wyy2gruyz16jvxkm2wav.jpg',
  });

  productId = product._id.toString();

  // Add product to cart using correct route
  await request(app)
    .post('/api/cart') 
    .set('Authorization', `Bearer ${token}`)
    .send({ productId, quantity: 2 });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('📦 Order API Tests', () => {
  test('✅ should place an order successfully', async () => {
    const res = await request(app)
      .post('/api/orders/place')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deliveryAddress: 'Kathmandu, Test Road',
        phone: '9800000000',
        paymentMethod: 'COD',
        itemsPrice: 200,
        shippingPrice: 0,
        totalPrice: 200,
      });

    console.log('🧾 Place order response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/order placed/i);
    orderId = res.body.orderId;
  },
  10000
  );

  test('📜 should get user order list', async () => {
    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('📄 should download invoice', async () => {
    await new Promise((res) => setTimeout(res, 1000)); // wait for PDF
    const res = await request(app)
      .get(`/api/orders/invoice/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
  });
});
