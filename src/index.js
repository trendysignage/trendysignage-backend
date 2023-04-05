const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const CreateAdmin = require("./utils/bootstrap");
// const socket = require("./libs/socket");

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  console.log("Connected to MongoDB");
  CreateAdmin();
  server = app.listen(config.port, () => {
    console.log(`Listening to port ${config.port}`);
  });
  //   socket.connectSocket(server);
});

const unexpectedErrorHandler = (error) => {
  logger.error(error);
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
