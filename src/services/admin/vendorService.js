import bcrypt from "bcryptjs";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Composition, Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import {
  generateId,
  paginationOptions,
} from "../../utils/universalFunction.js";
import { escapeRegex } from "../../validations/custom.validation.js";

export const getVendor = async (_id) => {
  const vendor = await Vendor.findOne({ _id, isDeleted: false })
    .lean()
    .populate([
      { path: "screens", populate: { path: "schedule" } },
      { path: "schedules" },
    ]);
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return vendor;
};

export const addVendor = async (name, email, pass, screens, duration) => {
  let password = await bcrypt.hash(pass, 8);
  if (await Vendor.findOne({ email, isDeleted: false, isVerified: true })) {
    throw new AuthFailedError(
      ERROR_MESSAGES.EMAIL_ALREADY_EXIST,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const id = await generateId();

  const defaultComp = await Composition.findOne({
    name: "Default Composition",
  }).lean();

  const vendor = await Vendor.create({
    id,
    name,
    email,
    password,
    isVerified: true,
    defaultComposition: {
      media: defaultComp,
      type: "composition",
      duration: 10,
    },
    totalScreens: screens,
    duration,
  });

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteVendor = async (_id) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return vendor;
};

export const list = async (query) => {
  let data = { isDeleted: false, isVerified: true };
  if (query.search) {
    query.search = escapeRegex(query.search);

    let searchRegex = RegExp(query.search, "i");

    data = {
      ...data,
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ],
    };
  }
  let [vendors, count] = await Promise.all([
    Vendor.find(data, {}, paginationOptions(query.page, query.limit)).populate([
      { path: "screens", populate: [{ path: "schedule" }, { path: "device" }] },
      { path: "schedules" },
    ]),
    Vendor.countDocuments({ isDeleted: data.isDeleted }),
  ]);

  return { vendors, count };
};
