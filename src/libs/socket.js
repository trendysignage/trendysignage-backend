import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  USER_TYPE,
} from "../config/appConstants.js";
import { socketService } from "../services/index.js";
import { AuthFailedError } from "../utils/errors.js";
import { Token, Vendor, Device } from "../models/index.js";
const io = new Server();

let userCache = {};

/*

   userCache ={
       userId:socketId,
       user2Id:socketId2
   }

*/

export const connectSocket = (server) => {
  io.attach(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });
  io.use(async function (socket, next) {
    console.log("user is trying to connect");
    if (socket.handshake.query.deviceToken) {
      console.log("device entered");
      let deviceToken = socket.handshake.query.deviceToken;
      const device = await Device.findOne({
        deviceToken: deviceToken,
        isDeleted: false,
      }).lean();
      if (!device) {
        throw new AuthFailedError(
          ERROR_MESSAGES.DEVICE_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
      let value = device.deviceToken;
      if (!userCache[value]) {
        userCache[value] = [socket.id];
      } else {
        userCache[value].push(socket.id);
      }
    } else {
      throw new AuthFailedError(
        ERROR_MESSAGES.AUTHENTICATION_FAILED,
        STATUS_CODES.ACTION_FAILED
      );
    }
    return next();
  }).on("connection", async (socket) => {
    let deviceToken = socket.handshake.query.deviceToken;
    console.log(userCache, "userCachhheeeeee", deviceToken);
    userCache[deviceToken].map(async (id) => {
      const vendorId = await socketService.getVendor(deviceToken);
      if (vendorId) {
        const defaultContent = await socketService.getDefault(vendorId);
        console.log("emitteddd", defaultContent);
        io.to(id).emit("receiveContent", defaultContent);
      }
    });
    socket.on("error", function (error) {
      console.error(error, "something went wrong in socket...");
    });
    socket.on("disconnect", async (data) => {
      userCache[socket.handshake.query.deviceToken] = userCache[
        socket.handshake.query.deviceToken
      ].filter((socketId) => socketId !== socket.id);
      console.log("disconneted", userCache);
    });
  });
};

export { io, userCache };
