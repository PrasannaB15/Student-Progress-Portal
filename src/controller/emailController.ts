import nodemailer from "nodemailer";
import { IData } from "../types";
import dotenv from "dotenv";

dotenv.config();

const sendEmail: IData = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Student Progress Portal" <${process.env.MAIL_ID}>`, // sender name & address
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    });

    console.log("📧 Email sent successfully. Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

export default sendEmail;
