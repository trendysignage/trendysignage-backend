const passport = require("passport");
const {
  USER_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} = require("../config/appConstants");
const { AuthFailedError } = require("../utils/errors");

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
      if (!token.isVerified) {
        return reject(
          new AuthFailedError(
            ERROR_MESSAGES.IS_VERIFIED,
            STATUS_CODES.AUTH_FAILED
          )
        );
      }
      if (token.isDeleted) {
        return reject(new AuthFailedError());
      }
      if (token.vendor.isDeleted) {
        return reject(new AuthFailedError());
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

module.exports = auth;
