import dotenv from "dotenv";
import fs from "fs";
import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import path from "path";
import config from "../config/config.js";
dotenv.config();
const __dirname = path.resolve();

var verification = fs.readFileSync(
  path.join(__dirname, "/views/email/verificationEmail.hbs"),
  "utf8"
);
var verificationEmailTemplate = Handlebars.compile(verification);

var resetPassword = fs.readFileSync(
  path.join(__dirname, "/views/email/resetPassword.hbs"),
  "utf8"
);
var resetPasswordTemplate = Handlebars.compile(resetPassword);

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

export const forgotPasswordEmail = async (email, token, userName) => {
  var info = {
    from: config.smtp.email,
    to: email,
    subject: "Reset Password",
    // attachments: [
    //   {
    //     filename: "logo.png",
    //     path: __dirname + "/images/logo.png",
    //     cid: "logo",
    //   },
    // ],
    html: resetPasswordTemplate({
      apiBaseUrl: config.baseurl,
      title: "Forgot Password",
      token,
      userName,
    }),
  };
  await sendEmail(info);
};

export const verificationEmail = async (email, userName, otp) => {
  var info = {
    from: `"TRENDYY ${config.smtp.email}`,
    to: email,
    subject: "Verification Email",
    // attachments: [
    //   {
    //     filename: "logo.png",
    //     path: __dirname + "/images/logo.png",
    //     cid: "logo",
    //   },
    // ],
    html: verificationEmailTemplate({
      title: "Verification Email",
      userName,
      otp,
    }),
  };
  await sendEmail(info);
};
