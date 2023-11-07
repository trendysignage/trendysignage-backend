import bcrypt from "bcryptjs";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  USER_TYPE,
} from "../../config/appConstants.js";
import { Reseller, Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import {
  generateId,
  paginationOptions,
} from "../../utils/universalFunction.js";

export const list = async (query) => {
  let data = { isDeleted: false };
  if (query.search) {
    let searchRegex = RegExp(query.search, "i");
    data = {
      ...data,
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ],
    };
  }
  let [reseller, count] = await Promise.all([
    Reseller.find(data, {}, paginationOptions(query.page, query.limit))
      .populate({ path: "vendors", select: ["name", "email", "socialId"] })
      .lean(),
    Reseller.countDocuments({ isDeleted: data.isDeleted }),
  ]);

  return { reseller, count };
};

export const addReseller = async (body) => {
  const id = await generateId();

  let password = await bcrypt.hash(body.password, 8);
  let query = {
    id,
    name: body.name,
    email: body.email,
    password,
  };
  body.clients && (query.vendors = body.clients);

  if (body.clients && body.clients.length > 0)
    for (const client of body.clients) {
      const vendor = await Vendor.findOne({
        _id: client,
        isDeleted: false,
        isVerified: true,
      }).lean();

      if (!vendor) {
        throw new AuthFailedError(
          ERROR_MESSAGES.VENDOR_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
    }

  if (await Reseller.findOne({ email: body.email, isDeleted: false })) {
    throw new AuthFailedError(
      ERROR_MESSAGES.EMAIL_ALREADY_EXIST,
      STATUS_CODES.ACTION_FAILED
    );
  }

  const reseller = await Reseller.create(query);

  if (body.clients && body.clients.length > 0)
    await Promise.all(
      ...body.clients?.map(async (client) => {
        await Vendor.updateOne(
          { _id: client },
          { $set: { reseller: reseller._id } }
        );
      })
    );

  if (!reseller) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const getReseller = async (resellerId) => {
  const reseller = await Reseller.findById(resellerId, { password: -1 })
    .lean()
    .populate({ path: "vendors" });

  if (!reseller) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return reseller;
};

export const editReseller = async (body) => {
  let password = await bcrypt.hash(body.password, 8);
  let query = {
    password,
  };
  body.clients && (query.vendors = body.clients);

  const reseller = await Reseller.findByIdAndUpdate(
    body.resellerId,
    {
      $set: query,
    },
    { new: 1, lean: 1 }
  ).lean();

  if (!reseller) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }

  await Promise.all(
    body.clients.map(async (client) => {
      await Vendor.updateOne(
        { _id: client },
        { $set: { reseller: reseller._id } }
      );
    })
  );

  return reseller;
};

export const deleteReseller = async (resellerId) => {
  const reseller = await Reseller.findByIdAndUpdate(
    resellerId,
    {
      $set: { isDeleted: true },
    },
    { new: 1, lean: 1 }
  ).lean();

  if (!reseller) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return reseller;
};

export const vendorsList = async (_id, query, role) => {
  let data = { isDeleted: false, isVerified: true };

  if (role === USER_TYPE.RESELLER)
    data = {
      ...query,
      reseller: _id,
    };

  const vendors = await Vendor.find(
    data,
    {
      name: 1,
      screens: 1,
      schedules: 1,
      email: 1,
      profilePic: 1,
      id: 1,
      isOnline: 1,
    },
    paginationOptions(query.page, query.limit)
  )
    .populate([
      {
        path: "screens",
        populate: [{ path: "schedule" }, { path: "device" }],
      },
      {
        path: "schedules",
      },
    ])
    .lean();

  return vendors;
};
