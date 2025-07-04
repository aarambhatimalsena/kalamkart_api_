import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import Otp from '../models/Otp.js';
import User from '../models/User.js';

jest.setTimeout(20000); 

let otpCode = '';
const email = 'resetme@example.com';

describe("🔁 OTP Flow Using Otp Model", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteOne({ email });
    await Otp.deleteOne({ email });
  });

  test("should send OTP for valid email", async () => {
    await new User({ name: "ResetUser", email, password: "pass123" }).save();

    const res = await request(app)
      .post("/api/otp/send-otp")
      .send({ email });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/otp sent/i);
  });

  test("should NOT fail even if email not registered", async () => {
    const res = await request(app)
      .post("/api/otp/send-otp")
      .send({ email: "unknown@example.com" });

    expect(res.statusCode).toBe(200);
  });

  test("should retrieve OTP from Otp collection", async () => {
    const otpEntry = await Otp.findOne({ email });
    expect(otpEntry).toBeTruthy();
    otpCode = otpEntry.otp;
    expect(otpCode).not.toBe('');
  });

  test("should verify correct OTP and return token", async () => {
    const res = await request(app)
      .post("/api/otp/verify-otp")
      .send({ email, otp: otpCode });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("should fail for invalid OTP", async () => {
    const res = await request(app)
      .post("/api/otp/verify-otp")
      .send({ email, otp: "000000" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message.toLowerCase()).toMatch(/invalid otp|otp not found/);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
});
