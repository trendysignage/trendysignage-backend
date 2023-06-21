import passport from "passport";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  USER_TYPE,
} from "../config/appConstants.js";
import { AuthFailedError } from "../utils/errors.js";

const verifyCallback =
  (req, resolve, reject, role) => async (err, token, info) => {
    if (err || info || !token) {
      return reject(new AuthFailedError());
    }

    if (role && token.role != role) {
      return reject(
        new AuthFailedError(
          ERROR_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.AUTH_FAILED
        )
      );
    }

    if (token.role === USER_TYPE.ADMIN && !token.admin) {
      return reject(new AuthFailedError());
    } else {
      if (token.otp) {
        if (token.otp.expiresAt < new Date()) {
          return reject(
            new AuthFailedError(
              ERROR_MESSAGES.OTP_EXPIRED,
              STATUS_CODES.AUTH_FAILED
            )
          );
        }
        req.token = token;
        return resolve();
      }
      if (!token.isVerified) {
        return reject(
          new AuthFailedError(
            ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
            STATUS_CODES.AUTH_FAILED
          )
        );
      }
      if (token.isDeleted) {
        return reject(new AuthFailedError());
      }
      if (token.vendor) {
        if (token.vendor.isDeleted) {
          return reject(
            new AuthFailedError(
              ERROR_MESSAGES.VENDOR_NOT_FOUND,
              STATUS_CODES.AUTH_FAILED
            )
          );
        }
        if (!token.vendor.isVerified) {
          return reject(
            new AuthFailedError(
              ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
              STATUS_CODES.AUTH_FAILED
            )
          );
        }
      }
    }

    req.token = token;
    return resolve();
  };

const auth = (role) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyCallback(req, resolve, reject, role)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

export default auth;
