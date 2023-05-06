import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const createTransporter = async () => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // Your Gmail ID
      pass: process.env.PASSWORD, // Your Gmail Password
    },
  });
  return transporter;
};

export const sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};
