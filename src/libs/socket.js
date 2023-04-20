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
      origin: ["http://localhost:3000"],
      // origin: ["https://my-frontend.com", "https://my-other-frontend.com", "http://localhost:3000"],
      credentials: true,
    },
  });
  io.use(function (socket, next) {
    console.log("user is trying to connect");
    if (socket.handshake.query.token) {
      console.log("user entered");
      jwt.verify(
        socket.handshake.query.token,
        config.jwt.secret,
        async function (err, decoded) {
          if (err || decoded.role == USER_TYPE.ADMIN) {
            console.log(err, "errorr connneecctionnn");
            throw new AuthFailedError(
              ERROR_MESSAGES.AUTHENTICATION_FAILED,
              STATUS_CODES.AUTH_FAILED
            );
          }
          const token = await Token.findOne({
            token: socket.handshake.query.token,
          }).lean();

          console.log(
            "decoded",
            decoded,
            token,
            "qwwwwwwwweerttttttttttyyyyyy"
          );
          socket.decoded = decoded;
          socket.decoded.user = token.vendor;
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
    }
    if (socket.handshake.query.deviceToken) {
      console.log("device entered");
      async function device(deviceToken) {
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
        return next();
      }
      device(socket.handshake.query.deviceToken);
    } else {
      console.log("error connecting");
      throw new AuthFailedError(
        ERROR_MESSAGES.AUTHENTICATION_FAILED,
        STATUS_CODES.AUTH_FAILED
      );
    }
  }).on("connection", async (socket) => {
    console.log(userCache, "userCachhheeeeee");
    userCache[socket.handshake.query.deviceToken].map(async (id) => {
      console.log(id, "socket idddddd");
      const vendorId = await socketService.getVendor(
        socket.handshake.query?.deviceToken
      );
      if (vendorId) {
        const defaultContent = await socketService.getDefault(vendorId);
        io.to(id).emit("receiveContent", defaultContent, "emitted default");
      }
    });
    // socket.on("sendContent", async (data) => {
    //   if (!data.screenId && !data.mediaId && !data.duration) {
    //     throw new AuthFailedError(
    //       "data is missing",
    //       STATUS_CODES.ACTION_FAILED
    //     );
    //   }
    //   let receiverId = [];
    //   for (const id of data.screenId) {
    //     let receiver = await socketService.getDevice(id);
    //     receiverId.push(receiver);
    //   }
    //   let content = await socketService.getContent(
    //     socket.handshake?.query?.token,
    //     data.mediaId
    //   );

    //   if (userCache[receiverId]) {
    //     userCache[receiverId].map(async (id) => {
    //       io.to(id).emit("receiveContent", content, data.duration);
    //     });
    //   }
    // });
    socket.on("error", function (error) {
      console.error(error, "something went wrong in socket...");
    });
    socket.on("disconnect", async (data) => {
      // console.log("disconnect....", socket.id, userCache[socket.decoded.user]);
      if (!socket.decoded) {
        userCache[socket.handshake.query.deviceToken] = userCache[
          socket.handshake.query.deviceToken
        ].filter((socketId) => socketId !== socket.id);
      } else {
        userCache[socket.decoded.user] = userCache[socket.decoded.user].filter(
          (socketId) => socketId !== socket.id
        );
      }
      console.log("disconneted", userCache);
    });
  });
};

export { io, userCache };
