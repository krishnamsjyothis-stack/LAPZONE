import Otp from "../models/Otp.js";
import sendEmail from "../utils/sendEmail.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const otp = generateOtp();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail(
      email,
      "LAPZONE Email Verification OTP",
      `Your LAPZONE verification OTP is ${otp}. It will expire in 5 minutes.`
    );

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return res.status(400).json({
        message: "OTP not found or already used",
      });
    }

    if (new Date() > otpData.expiresAt) {
      await Otp.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (otpData.otp !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    await Otp.deleteOne({ _id: otpData._id });

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
};