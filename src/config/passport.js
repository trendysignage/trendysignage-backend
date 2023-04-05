const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./config");
const { TOKEN_TYPE, USER_TYPE } = require("./appConstants");
const { Token } = require("../models");
const { AuthFailedError } = require("../utils/errors");

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== TOKEN_TYPE.ACCESS) {
      throw new AuthFailedError();
    }

    let token = {};

    if (payload.role === USER_TYPE.ADMIN) {
      token = await Token.findOne({ _id: payload.id, isDeleted: false })
        .populate({ path: "admin" })
        .lean();
    } else {
      token = await Token.findOne({ _id: payload.id, isDeleted: false })
        .populate({ path: "user" })
        .lean();
    }

    if (!token) {
      return done(null, false);
    }

    done(null, token);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
