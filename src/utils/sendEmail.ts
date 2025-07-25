import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const sendEmail = async (data: EmailData): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for port 465, false for 587
      auth: {
        user: process.env.MAIL_ID, // your email
        pass: process.env.MAIL_PASSWORD, // your app password
      },
    });

    await transporter.sendMail({
      from: `"Admin" <${process.env.MAIL_ID}>`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    });

    console.log(`Email sent to ${data.to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error; // rethrow to handle upstream if needed
  }
};

export default sendEmail;
