const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const passport = require("passport");
const morgan = require("morgan");
const compression = require("compression");
const { jwtStrategy } = require("./config/passport");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/common");
const { authLimiter } = require("./middlewares/common");
const i18n = require("./middlewares/i18n");
const {
  requestHandler,
  routeNotFoundHandler,
} = require("./middlewares/common");

const app = express();

app.use(express.static("public"));

app.use(i18n.init);

app.use((req, res, next) => {
  requestHandler(req, res, next);
});

// parse json request body
app.use(express.json());

app.use(morgan("dev"));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use("/user/auth", authLimiter);

// v1 api routes
app.use("/", routes);

app.use((req, res, next) => {
  routeNotFoundHandler(req, res, next);
});

app.use(errorHandler);

module.exports = app;
