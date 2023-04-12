import {
  ERROR_MESSAGES,
  STATUS_CODES,
  DEVICE_TYPE,
} from "../config/appConstants.js";
import { Vendor, Token } from "../models/index.js";
import { AuthFailedError } from "../utils/errors.js";

export const getConversation = async (conversationId) => {
  const conversation = await Conversations.findById(conversationId).lean();
  return conversation;
};

export const saveMessage = async (
  sender,
  receiver,
  conversationId,
  message,
  type
) => {
  let createdMessage = await Chats.create({
    sender,
    receiver,
    conversationId,
    message,
    type,
  });
  if (conversationId) {
    const conversation = await Conversations.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      type: createdMessage.type,
      messageTime: new Date(),
      isSeen: false,
      lastMessageBy: sender,
    });
    await Conversations.findByIdAndUpdate(conversationId, {
      $set: { deletedFor: [], messageDeletedFor: [] },
    });
  }
  return createdMessage;
};

export const blocked = async (senderId, receiverId) => {
  const sender = await User.findById(senderId).lean();
  const receiver = await User.findById(receiverId).lean();
  if (
    JSON.stringify(sender.blocked).includes(receiverId) ||
    JSON.stringify(receiver.blocked).includes(senderId)
  ) {
    console.log("blocked");
    return true;
  } else {
    console.log("unblocked");
    return false;
  }
};

export const getReceiver = async (receiverId, type) => {
  let [androidDeviceToken, iosDeviceToken, androidDeviceType, iosDeviceType] =
    await Promise.all([
      Token.find({
        user: receiverId,
        // "device.type": DEVICE_TYPE.ANDROID,
        isDeleted: false,
        isVerified: true,
      })
        .lean()
        .distinct("device.token"),
      Token.find({
        user: receiverId,
        // "device.type": DEVICE_TYPE.IOS,
        isDeleted: false,
        isVerified: true,
      })
        .lean()
        .distinct("device.apns"),
      Token.find({
        user: receiverId,
        "device.type": DEVICE_TYPE.ANDROID,
        isDeleted: false,
        isVerified: true,
      }).lean(),
      Token.find({
        user: receiverId,
        "device.type": DEVICE_TYPE.IPHONE,
        isDeleted: false,
        isVerified: true,
      }).lean(),
    ]);
  return {
    androidDeviceToken,
    iosDeviceToken,
    androidDeviceType,
    iosDeviceType,
  };
};

export const getUsers = async (senderId, receiverId) => {
  const receiver = await User.findById(receiverId)
    .lean()
    .select("_id profileImage name isDeleted isBlocked");
  const sender = await User.findById(senderId)
    .lean()
    .select("_id profileImage name isDeleted isBlocked");
  if (!receiver || !sender) {
    throw new AuthFailedError(
      ERROR_MESSAGES.USER_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return { sender, receiver };
};
