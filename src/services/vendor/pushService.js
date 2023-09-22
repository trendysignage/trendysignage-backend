import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import {
  Composition,
  Defaults,
  Quickplay,
  Schedule,
  Screen,
  Vendor,
} from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { localtime, utcTime } from "../../utils/formatResponse.js";
import { paginationOptions } from "../../utils/universalFunction.js";
import { emit } from "../socketService.js";

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
  if (query.tags) {
    data = { ...data, tags: { $in: query.tags } };
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

  await Promise.all([
    Screen.updateMany(
      { schedule: schedule._id },
      {
        $unset: { schedule: "" },
        $pull: { "contentPlaying.scheduleId": scheduleId },
      }
    ),
    Vendor.findByIdAndUpdate(
      vendorId,
      {
        $pull: { schedules: scheduleId },
      },
      { new: 1, lean: 1 }
    ),
  ]);
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
    dates: [new Date()],
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

  for (const _id of body.screens) {
    const composition = await Composition.findOne({
      _id: body.composition,
    }).lean();

    let contentPlaying = {
      media: composition,
      duration: body.duration,
      type: "composition",
      startTime: new Date(localtime(new Date(), timezone) + "Z"),
      endTime: new Date(localtime(new Date(), timezone) + "Z"),
      createdAt: new Date(localtime(new Date(), timezone) + "Z"),
    };

    contentPlaying.endTime.setSeconds(
      contentPlaying.startTime.getSeconds() + body.duration
    );

    const screen = await Screen.findOneAndUpdate(
      { _id },
      { $push: { contentPlaying } },
      { new: 1, lean: 1 }
    ).lean();

    await emit(screen.device?.deviceToken, contentPlaying);
    await emit(screen.device?.deviceToken, contentPlaying, "", body.type);
  }

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

export const getDefaultCompositions = async (vendor, query) => {
  let data = {
    vendor,
    isDeleted: false,
  };

  if (query.tags) {
    data = { ...data, tags: { $in: query.tags } };
  }

  let defaultComps = await Defaults.find(
    data,
    {},
    paginationOptions(query.page, query.limit)
  ).populate({ path: "composition" });

  if (query.search) {
    defaultComps = defaultComps.filter((comp) =>
      JSON.stringify(comp.composition.title.toLowerCase()).includes(
        query.search.toLowerCase()
      )
    );
  }

  return defaultComps;
};

export const addDefaultComp = async (vendor, body) => {
  const composition = await Composition.findOne({
    _id: body.compositionId,
    isDeleted: false,
  }).lean();

  if (!composition) {
    throw new AuthFailedError(
      ERROR_MESSAGES.COMPOSITION_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  const defaultComp = await Defaults.create({
    vendor,
    composition: composition._id,
    screens: body.screens,
  });

  for (const _id of body.screens) {
    const defaultComposition = {
      media: composition,
      duration: 600,
      type: "composition",
    };

    defaultComposition.media.isDefault = true;

    const screen = await Screen.findOneAndUpdate(
      { _id, isDeleted: false },
      { $set: { defaultComposition } },
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

export const editDefaultComposition = async (vendor, body) => {
  const defaultComp = await Defaults.findOneAndUpdate(
    {
      vendor,
      _id: body.defaultCompId,
      isDeleted: false,
    },
    { $set: { tags: body.tags } },
    { new: 1, lean: 1 }
  );

  if (!defaultComp) {
    throw new AuthFailedError(
      ERROR_MESSAGES.DEFAULT_COMPOSITION_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }
};

export const assignScreens = async (vendor, body) => {
  const schedule = await Schedule.findOne({
    _id: body.scheduleId,
    isDeleted: false,
  }).lean();

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

  console.log(schedule, "wekfnjwnfjn");

  for (const _id of body.screens) {
    const screen = await Screen.findOneAndUpdate(
      { _id, isDeleted: false },
      { $set: { schedule } },
      { new: 1, lean: 1 }
    );

    if (!screen) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }
  }
  await Schedule.updateOne(
    { _id: schedule._id },
    { $addToSet: { screens: { $each: body.screens } } }
  );
};

async function cc() {
  console.log(
    await Screen.findOneAndUpdate(
      {},
      { $pull: { "contentPlaying.scheduleId": "650da0bad725af6b93e45575" } },
      { new: 1, lean: 1 }
    )
  );
}
cc();
