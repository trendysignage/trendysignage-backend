import bcrypt from "bcryptjs";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Admin, Composition, Reseller, Vendor } from "../../models/index.js";
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

export const addVendor = async (
  _id,
  name,
  email,
  pass,
  screens,
  duration,
  startDate,
  endDate,
  resellerId
) => {
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

  if (resellerId) {
    var reseller = await Reseller.findOne({ _id: resellerId }).lean();
  }

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
    subscription: {
      startDate,
      endDate,
    },
    reseller: reseller?._id ?? null,
  });

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }

  await Promise.all([
    Admin.updateOne({ _id }, { $addToSet: { vendors: vendor._id } }),
    Reseller.updateOne(
      { _id: resellerId },
      { $addToSet: { vendors: vendor._id } }
    ),
  ]);
};

export const editVendor = async (
  _id,
  vendorId,
  name,
  screens,
  duration,
  startDate,
  endDate
) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      _id: vendorId,
      isDeleted: false,
      isVerified: true,
    },
    {
      $set: {
        name,
        totalScreens: screens,
        duration,
        "subscription.startDate": startDate,
        "subscription.endDate": endDate,
      },
    },
    { new: 1, lean: 1 }
  );

  if (!vendor) {
    throw new AuthFailedError(
      ERROR_MESSAGES.VENDOR_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteVendor = async (adminId, _id) => {
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
  await Admin.updateOne({ _id: adminId }, { $pull: { vendors: _id } });
  return vendor;
};

export const list = async (_id, query) => {
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

  const [vendors, count] = await Promise.all([
    Vendor.find(data, {}, paginationOptions(query.page, query.limit))
      .populate([
        {
          path: "screens",
          populate: [{ path: "schedule" }, { path: "device" }],
        },
        {
          path: "schedules",
        },
        {
          path: "reseller",
          select: ["name", "email"],
        },
      ])
      .lean(),
    Vendor.countDocuments(data),
  ]);

  return { vendors, count };
};
