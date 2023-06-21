import { ExtractJwt, Strategy } from "passport-jwt";
import { Token } from "../models/index.js";
import { AuthFailedError } from "../utils/errors.js";
import { TOKEN_TYPE, USER_TYPE } from "./appConstants.js";
import config from "./config.js";

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
        .populate({ path: "vendor" })
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

const jwtStrategy = new Strategy(jwtOptions, jwtVerify);

export { jwtStrategy };
