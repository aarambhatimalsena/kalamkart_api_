// controllers/otpController.js or wherever you have it
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/emailSender.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

//  /send-otp
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = generateOtp();

  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "✅ OTP sent to your email!" });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to send OTP", error: err.message });
  }
};

//  /verify-otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "❌ OTP not found. Please request again." });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: "❌ Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "❌ OTP expired" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: email.split("@")[0],
        email,
        isOtpUser: true,
      });
      await user.save();
    }

    await Otp.deleteOne({ email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error", error: err.message });
  }
};
