import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import {
  Composition,
  Quickplay,
  Schedule,
  Screen,
  Vendor,
} from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { localtime, utcTime } from "../../utils/formatResponse.js";
import { paginationOptions } from "../../utils/universalFunction.js";

export const schedules = async (vendorId, query) => {
  let data = {
    createdBy: vendorId,
    isDeleted: false,
    sequence: { $ne: [] },
  };

  if (query.search) {
    let searchReg = RegExp(query.search, "i");
    data = { ...data, name: { $regex: searchReg } };
  }

  let schedules = await Schedule.find(
    data,
    {},
    paginationOptions(query.page, query.limit)
  ).populate({ path: "sequence.timings.composition" });

  return schedules;
};

export const getSchedule = async (scheduleId) => {
  const schedule = await Schedule.findOne({
    _id: scheduleId,
    isDeleted: false,
  })
    .lean()
    .populate([{ path: "sequence.timings.composition" }, { path: "screens" }]);

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
  };
  const schedule = await Schedule.create(data);
  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SERVER_ERROR,
      STATUS_CODES.ACTION_FAILED
    );
  }
  if (body.screens) {
    for (const s of body.screens) {
      const screen = await Screen.findOneAndUpdate(
        {
          _id: s,
          isDeleted: false,
        },
        { $set: { schedule: schedule._id } },
        { new: true, lean: 1 }
      );
      if (!screen) {
        throw new AuthFailedError(
          ERROR_MESSAGES.SCREEN_NOT_FOUND,
          STATUS_CODES.ACTION_FAILED
        );
      }
    }
  }
  await Vendor.findByIdAndUpdate(
    vendorId,
    { $addToSet: { schedules: schedule._id } },
    { new: 1, lean: 1 }
  );
  return schedule;
};

export const editSchedule = async (vendorId, body) => {
  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: body.scheduleId,
      createdBy: vendorId,
      isDeleted: false,
    },
    {
      $set: {
        name: body.name,
        screens: body.screens,
      },
    },
    { new: true, lean: 1 }
  );

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  for (const id of body.screens) {
    const screen = await Screen.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
      },
      { $set: { schedule: schedule._id } },
      { new: 1, lean: 1 }
    ).lean();
    if (!screen) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
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

  await Screen.findOneAndUpdate(
    { schedule: schedule._id },
    { $unset: { schedule: "" } }
  );

  await Vendor.findByIdAndUpdate(
    vendorId,
    {
      $pull: { schedules: scheduleId },
    },
    { new: 1, lean: 1 }
  );
};

export const sequenceList = async (vendorId, _id) => {
  const schedule = await Schedule.findOne(
    {
      _id,
      isDeleted: false,
    },
    { sequence: 1, screens: 1 }
  )
    .lean()
    .populate([{ path: "sequence.timings.composition" }, { path: "screens" }]);

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  delete schedule.screens;
  return schedule;
};

export const getSequence = async (query) => {
  const schedule = await Schedule.findOne(
    {
      _id: query.scheduleId,
      isDeleted: false,
      "sequence._id": query.sequenceId,
    },
    { "sequence.$": 1 }
  )
    .lean()
    .populate({ path: "sequence.timings.composition" });

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return schedule;
};

export const addSequence = async (vendorId, body, timezone) => {
  body.timings.forEach((i) => {
    i.startTime = utcTime(i.startTime, timezone);
    i.endTime = utcTime(i.endTime, timezone);
  });

  let data = {
    name: body.name,
    timings: body.timings,
  };

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: body.scheduleId,
      createdBy: vendorId,
      isDeleted: false,
    },
    { $push: { sequence: data } },
    { new: true, lean: 1 }
  );

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  return schedule;
};

export const editSequence = async (vendorId, body, timezone) => {
  body.timings.forEach((i) => {
    i.startTime = utcTime(i.startTime, timezone);
    i.endTime = utcTime(i.endTime, timezone);
  });

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: body.scheduleId,
      "sequence._id": body.sequenceId,
      createdBy: vendorId,
      isDeleted: false,
    },
    {
      $set: {
        "sequence.$.name": body.name,
        "sequence.$.timings": body.timings,
      },
    },
    { new: true, lean: 1 }
  );

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return schedule;
};

export const deleteSequence = async (vendorId, query) => {
  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: query.scheduleId,
      "sequence._id": query.sequenceId,
      createdBy: vendorId,
      isDeleted: false,
    },
    { $pull: { sequence: { _id: query.sequenceId } } },
    { new: true, lean: 1 }
  );

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  return schedule;
};

export const dates = async (vendorId, body) => {
  let schedule;
  for (const seq of body.scheduleArray) {
    schedule = await Schedule.findOneAndUpdate(
      {
        _id: body.scheduleId,
        createdBy: vendorId,
        "sequence._id": seq.sequenceId,
        isDeleted: false,
      },
      { $set: { "sequence.$.dates": seq.dates } },
      { new: true, lean: 1 }
    );

    if (!schedule) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  }

  return schedule;
};

export const getQuickplay = async (vendorId, query) => {
  let data = {
    isDeleted: false,
    createdBy: vendorId,
  };

  if (query.search) {
    let searchReg = RegExp(query.search, "i");
    data = { ...data, name: { $regex: searchReg } };
  }

  const quickplay = await Quickplay.find(
    data,
    {},
    paginationOptions(query.page, query.limit)
  )
    .populate({ path: "composition" })
    .lean();

  return quickplay;
};

export const addQuickplay = async (vendorId, body, timezone) => {
  for (const _id of body.screens) {
    if (!(await Screen.findOne({ _id, isDeleted: false }))) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  }

  if (
    !(await Composition.findOne({ _id: body.compositionId, isDeleted: false }))
  ) {
    throw new AuthFailedError(
      ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
  const startTime = new Date(localtime(new Date(), timezone) + "Z");
  const endTime = new Date(localtime(new Date(), timezone) + "Z");
  endTime.setSeconds(endTime.getSeconds() + body.duration);

  const quickplay = await Quickplay.create({
    createdBy: vendorId,
    screens: body.screens,
    duration: body.duration,
    name: body.name,
    composition: body.composition,
    tags: body.tags,
    startTime,
    endTime,
  });

  return quickplay;
};

export const deleteQuickplay = async (createdBy, _id) => {
  const quickplay = await Quickplay.findOneAndUpdate(
    {
      _id,
      createdBy,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: 1, lean: 1 }
  );

  if (!quickplay) {
    throw new AuthFailedError(
      ERROR_MESSAGES.QUICKPLAY_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};
