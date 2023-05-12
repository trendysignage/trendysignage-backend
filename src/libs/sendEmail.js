import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import config from "../config/config.js";
const __dirname = path.resolve();

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
