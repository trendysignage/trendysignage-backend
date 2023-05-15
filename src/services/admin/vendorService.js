import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import config from "../../config/config.js";
import { Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import bcrypt from "bcryptjs";

export const getVendor = async (_id) => {
  const vendor = await Vendor.findOne({ _id, isDeleted: false }).lean();
  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return vendor;
};

export const addVendor = async (name, email, pass, screens) => {
  let password = await bcrypt.hash(pass, 8);
  const vendor = await Vendor.create({
    name,
    email,
    password,
    isVerified: true,
    defaultComposition: config.defaultComposition,
    totalScreens: screens,
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
  let vendors = await Vendor.find({ isDeleted: false })
    .lean()
    .skip(query.page * query.limit)
    .limit(query.limit);

  if (query.search) {
    vendors = vendors.filter((id) =>
      JSON.stringify(id.name.toLowerCase()).includes(query.search.toLowerCase())
    );
  }
  return vendors;
};

async function up() {
  await Vendor.updateMany({}, { $set: { totalScreens: 5 } });
}

up();
