const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const passport = require("passport");
const compression = require("compression");
const morgan = require("morgan");

const { jwtStrategy } = require("./config/passport");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/common");
const scheduler = require("./libs/scheduler");
const { authLimiter } = require("./middlewares/common");
const i18n = require("./middlewares/i18n");

const {
  requestHandler,
  routeNotFoundHandler,
} = require("./middlewares/common");

const app = express();

app.set("view engine", "hbs");
app.use(express.static("public"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

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

// limit repeated failed requests to auth endpoints
app.use("/user/auth", authLimiter);

// v1 api routes
app.use("/", routes);

//send back a 404 error for any unknown api request
app.use((req, res, next) => {
  routeNotFoundHandler(req, res, next);
});

// handle error

app.use(errorHandler);

module.exports = app;
