import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Vendor, Screen, Device } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { io, userCache } from "../../libs/socket.js";

export const defaultComposition = async (vendorId, body) => {
  let media = {
    title: body.title,
    type: body.type,
  };
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      isDeleted: false,
    },
    { $set: { defaultComposition: { media, duration: body.duration } } },
    { new: true, lean: 1 }
  )
    .lean()
    .populate({ path: "screens", populate: { path: "device" } });
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  vendor.screens.map((screen) => {
    if (screen.device) {
      let value = screen.device.deviceToken;
      if (!userCache[value]) {
        userCache[value] = userCache[value];
      }
      console.log(userCache);
      userCache[value].map((id) => {
        io.to(id).emit("receiveContent", vendor.defaultComposition);
      });
    }
  });
};
