import mongoose from "mongoose";
import app from "./src/app.js";
import config from "./src/config/config.js";
import CreateAdmin from "./src/utils/bootstrap.js";

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  console.log("Connected to MongoDB");
  CreateAdmin();
  server = app.listen(config.port, () => {
    console.log(`Listening to port ${config.port}`);
  });
});

const unexpectedErrorHandler = (error) => {
  console.error(error);
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  console.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
