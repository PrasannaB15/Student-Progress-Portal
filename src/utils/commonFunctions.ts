import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import sendEmail from "../controller/emailController";
import { User } from "../types";
import { usersCollection } from "../config/firebase-admin";

const generateToken = (id: string) => {
  const tokenSecret = process.env.JWT_SECRET ?? "";
  return jwt.sign({ id }, tokenSecret, { expiresIn: "1d" });
};

const generateOTP = (length: number = 6) => {
  return otpGenerator.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

function isOTPIsExpired(
  otpCreatedAt: { _seconds: number; _nanoseconds: number } | Date,
  expiryMinutes: number
): boolean {
  let otpCreationTime: Date;

  // Firestore timestamp case
  if (
    typeof otpCreatedAt === "object" &&
    "_seconds" in otpCreatedAt &&
    "_nanoseconds" in otpCreatedAt
  ) {
    otpCreationTime = new Date(
      otpCreatedAt._seconds * 1000 + otpCreatedAt._nanoseconds / 1000000
    );
  } else {
    // Native Date object case
    otpCreationTime = otpCreatedAt as Date;
  }

  const currentTime = new Date();
  const expirationTime = new Date(otpCreationTime.getTime() + expiryMinutes * 60000);

  return currentTime > expirationTime;
}

const sendOTP = async (email: string, otp: string) => {
  const data = {
    html: `<h2>Verify your account</h2><p>Your OTP is <b>${otp}</b></p>`,
    to: email,
    text: `Your OTP is ${otp}`,
    subject: "OTP Verification",
  };
  await sendEmail(data);
};

const getUserDataWithoutSensitiveFields = (user: User) => {
  const { password, otp, otp_expires, ...cleanUser } = user;
  return cleanUser;
};

const getUserDataFromDocument = async (email: string) => {
  const snap = await usersCollection.where("email", "==", email).get();
  if (snap.empty) return null;
  return snap.docs[0]?.data() as User;
};

const sendVerificationCode = async (user: User) => {
  const otp = generateOTP(6);
  await usersCollection.doc(user.id).update({
    otp,
    otp_expires: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
  });
  await sendOTP(user.email, otp);
};

const getUserDataFromDocumentById = async (id: string) => {
  const doc = await usersCollection.doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
};

export { getUserDataFromDocumentById };

export {
  generateToken,
  generateOTP,
  isOTPIsExpired,
  sendOTP,
  getUserDataWithoutSensitiveFields,
  getUserDataFromDocument,
  sendVerificationCode,
};
