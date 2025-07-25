import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

// Messages and constants
import { STATUS } from "../messages/statusCodes";
import { ERRORS } from "../messages/errors";
import { SUCCESS } from "../messages/success";

// Utilities and Firebase
import {
  generateOTP,
  sendOTP,
  getUserDataFromDocument,
  getUserDataWithoutSensitiveFields,
  isOTPIsExpired,
  sendVerificationCode,
  generateToken,
} from "../utils/commonFunctions";
import { usersCollection } from "../config/firebase-admin";
import { User } from "../types";

// Create a new user and send OTP
export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const existingUser = await getUserDataFromDocument(email);
  if (existingUser) {
    res.status(STATUS.badRequest).json({ error: ERRORS.user_already_exists });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP(6);

  const newUserRef = usersCollection.doc();
  await newUserRef.set({
    id: newUserRef.id,
    name,
    email,
    password: hashedPassword,
    otp,
    otp_expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    verified: false,
  });

  await sendOTP(email, otp); // make sure to await
  res.status(STATUS.created).json({ message: SUCCESS.otp_send });
});

// Verify registration OTP
export const verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { otp, email } = req.body;

  const user = await getUserDataFromDocument(email);
  if (!user) {
    res.status(STATUS.notFound).json({ error: ERRORS.user_not_found });
    return;
  }

  if (isOTPIsExpired(user.otp_expires, 10)) {
    res.status(STATUS.badRequest).json({ error: ERRORS.expired_otp });
    return;
  }

  if (user.otp !== otp) {
    res.status(STATUS.badRequest).json({ error: ERRORS.invalidOTP });
    return;
  }

  await usersCollection.doc(user.id).update({ verified: true });
  res.status(STATUS.success).json({ message: SUCCESS.account_verified });
});

// Login user
export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(STATUS.badRequest).json({ error: "Email and password are required" });
    return;
  }

  const user = await getUserDataFromDocument(email);

  if (!user) {
    res.status(STATUS.notFound).json({ error: "User not found" });
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    res.status(STATUS.unauthorized).json({ error: "Incorrect password" });
    return;
  }

  if (!user.verified) {
    await sendVerificationCode(user as User);
    res.status(STATUS.unauthorized).json({ error: "Account not verified. OTP sent again." });
    return;
  }

  const token = generateToken(user.id);
  const userWithoutSensitiveFields = getUserDataWithoutSensitiveFields(user as User);

  res.status(STATUS.success).json({
    ...userWithoutSensitiveFields,
    token,
  });
});

// Forgot password - send OTP
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await getUserDataFromDocument(email);
  if (!user) {
    res.status(STATUS.notFound).json({ error: ERRORS.user_not_found });
    return;
  }

  await sendVerificationCode(user as User);

  res.status(STATUS.success).json({ message: SUCCESS.otp_send });
});

// Verify forgot-password OTP
export const verifyForgotPasswordOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { otp, email } = req.body;
  const user = await getUserDataFromDocument(email);

  if (!user) {
    res.status(STATUS.notFound).json({ error: ERRORS.user_not_found });
    return;
  }

  if (isOTPIsExpired(user.otp_expires, 10)) {
    res.status(STATUS.badRequest).json({ error: ERRORS.expired_otp });
    return;
  }

  if (user.otp !== otp) {
    res.status(STATUS.badRequest).json({ error: ERRORS.invalidOTP });
    return;
  }

  res.status(STATUS.success).json({ message: SUCCESS.verified });
});

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await getUserDataFromDocument(email);

  if (!user) {
    res.status(STATUS.notFound).json({ error: ERRORS.user_not_found });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await usersCollection.doc(user.id).update({ password: hashedPassword });

  res.status(STATUS.success).json({ message: SUCCESS.password_updated });
});

// Resend OTP
export const resendVerificationCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await getUserDataFromDocument(email);

  if (!user) {
    res.status(STATUS.notFound).json({ error: ERRORS.user_not_found });
    return;
  }

  await sendVerificationCode(user as User);
  res.status(STATUS.success).json({ message: SUCCESS.otp_send });
});
