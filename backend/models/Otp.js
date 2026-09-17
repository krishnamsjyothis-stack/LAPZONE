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
      enum: ["signup", "forgot-password", "change-email"],
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

const Otp =
  mongoose.models.Otp ||
  mongoose.model("Otp", otpSchema);

export default Otp;