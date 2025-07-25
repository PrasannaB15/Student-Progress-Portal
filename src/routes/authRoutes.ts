import express from "express";
import {
  createUser,
  verifyOTP,
  loginUser,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  resendVerificationCode,
} from "../controller/authController";
import { authMiddleware } from "../middlewares/authMiddleWare";

const router = express.Router();

// Register & OTP
router.post("/register", createUser);
router.post("/verify", verifyOTP);
router.post("/resend-otp", resendVerificationCode);

// Login
router.post("/login", loginUser);

// Forgot Password Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

// Get current logged-in user info
router.get("/me", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.status(200).json(user);
  return;
});

export default router;
