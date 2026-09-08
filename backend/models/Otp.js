import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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

    purpose: {
      type: String,
      enum: ["signup", "forgot-password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Otp", otpSchema);