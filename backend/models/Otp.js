import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  name: {
    type: String,
  },

  password: {
    type: String,
  },

  referralCode: {
    type: String,
    default: null,
    trim: true,
    uppercase: true,
  },

  purpose: {
    type: String,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

const Otp =
  mongoose.models.Otp ||
  mongoose.model("Otp", otpSchema);

export default Otp;