import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import passport from "passport";
import morgan from "morgan";
import compression from "compression";
import { jwtStrategy } from "./config/passport.js";
import routes from "./routes/index.js";
import { errorHandler, authLimiter } from "./middlewares/common.js";
import i18n from "./middlewares/i18n.js";
import { requestHandler, routeNotFoundHandler } from "./middlewares/common.js";

const app = express();

app.use(
  express.static("public/", {
    maxAge: "5d",
    setHeaders: (res) => {
      res.set("Cache-Control", "public, max-age=86400");
    },
  })
);

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

export default app;
