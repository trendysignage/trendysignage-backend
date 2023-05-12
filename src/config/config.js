import Joi from "joi";
import dotenv from "dotenv";
import path from "path";
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, ".env") });

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().required(),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    EMAIL: Joi.string().description("username for email server"),
    PASSWORD: Joi.string().description("password for email server"),
    PROJECT_NAME: Joi.string().required().description("Name of project"),
    API_BASE_URL: Joi.string().required().description("Api base url"),
    ADMIN_BASE_URL: Joi.string().description("Admin pannel base url"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error}`);
}

export default {
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  fcm: envVars.SERVER_KEY,
  baseurl: envVars.API_BASE_URL,
  projectName: envVars.PROJECT_NAME,
  panelurl: envVars.ADMIN_BASE_URL,
  smtp: {
    email: envVars.EMAIL,
    password: envVars.PASSWORD,
  },
};
