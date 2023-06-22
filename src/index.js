import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/config.js";
import * as socket from "./libs/socket.js";
import CreateAdmin from "./utils/bootstrap.js";
import cron from "./libs/scheduler.js"

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  console.log("Connected to MongoDB");
  CreateAdmin();
  server = app.listen(config.port, () => {
    console.log(`Listening to port ${config.port}`);
  });
  socket.connectSocket(server);
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
