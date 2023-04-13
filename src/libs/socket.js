import socket from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  DEVICE_TYPE,
  USER_TYPE,
} from "../config/appConstants.js";
import { socketService } from "../services/index.js";
import { AuthFailedError } from "../utils/errors.js";
import { Token, Vendor, Device } from "../models/index.js";

let userCache = {};

/*

   userCache ={
       userId:socketId,
       user2Id:socketId2
   }

*/

exports.connectSocket = (server) => {
  io = socket(server);
  io.use(function (socket, next) {
    console.log("user is trying to connect");
    if (socket.handshake.query && socket.handshake.query.token) {
      console.log("user entered");
      jwt.verify(
        socket.handshake.query.token,
        config.jwt.secret,
        async function (err, decoded) {
          if (err || decoded.role == USER_TYPE.ADMIN)
            throw new AuthFailedError(
              ERROR_MESSAGES.AUTHENTICATION_FAILED,
              STATUS_CODES.AUTH_FAILED
            );
          const device = await Device.findOne({
            deviceToken: socket.handshake.query.token,
          }).lean();

          console.log(
            "decoded",
            decoded,
            device,
            "qwwwwwwwweerttttttttttyyyyyy"
          );
          socket.decoded = decoded;
          socket.decoded.user = device._id;
          let value = socket.decoded.user;
          if (!userCache[value]) {
            userCache[value] = [socket.id];
          } else {
            userCache[value].push(socket.id);
          }
          console.log("socketHolder", userCache);
          return next();
        }
      );
    } else {
      throw new AuthFailedError(
        ERROR_MESSAGES.AUTHENTICATION_FAILED,
        STATUS_CODES.AUTH_FAILED
      );
    }
  }).on("connection", (socket) => {
    socket.on("sendMessage", async (data) => {
      let message;
      if (!data && !data.type) {
        throw new AuthFailedError(
          "data is missing",
          STATUS_CODES.ACTION_FAILED
        );
      }
      // const conversation = await socketService.getConversation(
      //   data.conversationId
      // );
      // if (!conversation) {
      //   throw new AuthFailedError(
      //     "conversation not found",
      //     STATUS_CODES.ACTION_FAILED
      //   );
      // }

      const senderId = socket.decoded.user;
      let receiverId;
      if (
        JSON.stringify(data.receiver) === JSON.stringify(socket.decoded.user)
      ) {
        receiverId = data.sender;
      } else {
        receiverId = data.receiver;
      }
      // message = await socketService.saveMessage(
      //   senderId,
      //   receiverId,
      //   conversation._id,
      //   data.message,
      //   data.type
      // );
      // let { androidDeviceToken, androidDeviceType, iosDeviceType } =
      //   await socketService.getReceiver(data.receiver, "msg");
      const { sender, receiver } = await socketService.getUsers(
        senderId,
        receiverId
      );
      if (userCache[receiverId]) {
        userCache[receiverId].map(async (id) => {
          io.to(id).emit("receiveMessage", message);
        });
      }
    });
    socket.on("error", function (error) {
      console.error(error, "something went wrong in socket...");
    });
    socket.on("disconnect", async (data) => {
      console.log("disconnect....", socket.id, userCache[socket.decoded.user]);

      userCache[socket.decoded.user] = userCache[socket.decoded.user].filter(
        (socketId) => socketId !== socket.id
      );
      console.log("disconneted", userCache);
    });
  });
};
