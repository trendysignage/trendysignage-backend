import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Composition, Schedule, Vendor } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { emit } from "../socketService.js";

export const schedules = async (vendorId, query) => {
  let schedules = await Schedule.find({
    createdBy: vendorId,
    isDeleted: false,
  }).lean();

  if (query.search) {
    schedules = schedules.filter((s) =>
      JSON.stringify(s.name.toLowerCase()).includes(query.search.toLowerCase())
    );
  }

  return schedules;
};

export const getSchedule = async (scheduleId) => {
  const schedule = await Schedule.findOne({
    _id: scheduleId,
    isDeleted: false,
  })
    .lean()
    .populate([{ path: "sequence.composition" }, { path: "screens" }]);

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return schedule;
};

export const addSchedule = async (vendorId, body) => {
  let data = {
    name: body.name,
    screens: body.screens,
    createdBy: vendorId,
    sequence: body.sequence,
  };
  const schedule = await Schedule.create(data);
  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
  for (const c of body.sequence) {
    const composition = await Composition.findOneAndUpdate(
      { _id: c.composition },
      { $addToSet: { schedules: schedule._id } },
      { new: 1, lean: 1 }
    );
    if (!composition) {
      throw new AuthFailedError(
        ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  }
  await Vendor.findByIdAndUpdate(
    vendorId,
    { $addToSet: { schedules: schedule._id } },
    { new: 1, lean: 1 }
  );
};

export const editSchedule = async (vendorId, body) => {
  let data = {
    name: body.name,
    sequence: body.sequence,
    createdBy: vendorId,
    screens: body.screens,
  };

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: body.scheduleId,
      isDeleted: false,
    },
    { $set: data },
    { new: true, lean: 1 }
  );

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const deleteSchedule = async (vendorId, scheduleId) => {
  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: scheduleId,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  await Vendor.findByIdAndUpdate(
    vendorId,
    {
      $pull: { schedules: scheduleId },
    },
    { new: 1, lean: 1 }
  );
};
