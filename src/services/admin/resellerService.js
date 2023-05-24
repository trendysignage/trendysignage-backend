import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Reseller } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import {
  generateId,
  paginationOptions,
} from "../../utils/universalFunction.js";
import { escapeRegex } from "../../validations/custom.validation.js";

export const list = async (query) => {
  let data = { isDeleted: false };
  if (query.search) {
    query.search = escapeRegex(query.search);
    let searchRegex = new RegExp(query.search, "ig");

    data = {
      ...data,
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ],
    };
  }
  let [reseller, count] = await Promise.all([
    Reseller.find(data, {}, paginationOptions(query.page, query.limit)),
    Reseller.countDocuments({ isDeleted: data.isDeleted }),
  ]);

  return { reseller, count };
};

export const addReseller = async (body) => {
  const id = await generateId();

  let query = {
    id,
    name: body.name,
    email: body.email,
    comission: body.comission,
  };
  query.vendors && body.clients;

  if (await Reseller.findOne({ email: body.email, isDeleted: false })) {
    throw new AuthFailedError(
      ERROR_MESSAGES.EMAIL_ALREADY_EXIST,
      STATUS_CODES.ACTION_FAILED
    );
  }

  const reseller = await Reseller.create(query);

  if (!reseller) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const getReseller = async (resellerId) => {
  const reseller = await Reseller.findById(resellerId)
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
  let query = {
    comission: body.comission,
  };
  query.vendors && body.clients;

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
