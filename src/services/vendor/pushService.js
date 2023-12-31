import {
  ERROR_MESSAGES,
  SCREEN_SETTINGS,
  STATUS_CODES,
} from "../../config/appConstants.js";
import {
  Composition,
  Defaults,
  Layout,
  Quickplay,
  Schedule,
  Screen,
  Vendor,
} from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";
import { localtime, utcTime } from "../../utils/formatResponse.js";
import { paginationOptions } from "../../utils/universalFunction.js";
import { displayService, layoutService } from "../index.js";
import { emit } from "../socketService.js";

export const schedules = async (vendorId, query) => {
  const [defaultComp, vendor] = await Promise.all([
    Composition.findOne({
      name: "Default Composition",
      isDefault: true,
    }).lean(),
    Vendor.findById(vendorId).lean(),
  ]);

  let data = {
    createdBy: vendorId,
    isDeleted: false,
    sequence: { $ne: [] },
  };

  if (vendor.vendor) data.createdBy = vendor.vendor;

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

  for (const schedule of schedules) {
    for (const seq of schedule.sequence) {
      for (const timing of seq.timings) {
        if (!timing.composition || timing.composition == null) {
          timing.composition = defaultComp;
        }
      }
    }
  }

  return schedules;
};

export const getSchedule = async (scheduleId) => {
  const defaultComp = await Composition.findOne({
    name: "Default Composition",
    isDefault: true,
  }).lean();

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

  for (const seq of schedule.sequence) {
    for (const timing of seq.timings) {
      if (!timing.composition || timing.composition == null) {
        timing.composition = defaultComp;
      }
    }
  }

  return schedule;
};

export const addSchedule = async (vendorId, body) => {
  const vendor = await Vendor.findById(vendorId).lean();
  if (vendor.role !== "ADMIN" && !vendor.roles[vendor.role]["SCHEDULE"].add) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }

  let data = {
    name: body.name,
    screens: body.screens,
    createdBy: vendorId,
  };
  if (vendor) data.createdBy = vendor.vendor;

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
    data.createdBy,
    { $addToSet: { schedules: schedule._id } },
    { new: 1, lean: 1 }
  );
  return schedule;
};

export const editSchedule = async (vendorId, body) => {
  const vendor = await Vendor.findById(vendorId).lean();
  if (vendor.role !== "ADMIN" && !vendor.roles[vendor.role]["SCHEDULE"].edit) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: body.scheduleId,
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
  const subvendor = await Vendor.findById(vendorId).lean();
  if (
    subvendor.role !== "ADMIN" &&
    !subvendor.roles[subvendor.role]["SCHEDULE"].delete
  ) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }

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

  const screens = await Screen.find(
    { schedule: schedule._id },
    { _id: 1 }
  ).lean();

  const [data, vendor, updatedScreens] = await Promise.all([
    Screen.updateMany(
      { schedule: schedule._id },
      {
        $unset: { schedule: "" },
        $pull: { contentPlaying: { scheduleId: scheduleId } },
      }
    ),
    Vendor.findByIdAndUpdate(
      vendorId,
      {
        $pull: { schedules: scheduleId },
      },
      { new: 1, lean: 1 }
    ),
    Screen.find({ _id: { $in: screens } })
      .populate({ path: "device" })
      .lean(),
    Vendor.findByIdAndUpdate(
      subvendor.vendor,
      {
        $pull: { schedules: scheduleId },
      },
      { new: 1, lean: 1 }
    ),
  ]);

  for (const screen of updatedScreens)
    emit(screen.device?.deviceToken, screen.contentPlaying);
};

export const sequenceList = async (vendorId, _id) => {
  const defaultComp = await Composition.findOne({
    name: "Default Composition",
    isDefault: true,
  }).lean();

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

  for (const seq of schedule.sequence) {
    for (const timing of seq.timings) {
      if (!timing.composition || timing.composition == null) {
        timing.composition = defaultComp;
      }
    }
  }

  delete schedule.screens;
  return schedule;
};

export const getSequence = async (query) => {
  const defaultComp = await Composition.findOne({
    name: "Default Composition",
    isDefault: true,
  }).lean();

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

  for (const seq of schedule.sequence) {
    for (const timing of seq.timings) {
      if (!timing.composition || timing.composition == null) {
        timing.composition = defaultComp;
      }
    }
  }

  return schedule;
};

export const addSequence = async (vendorId, body, timezone) => {
  for (const i of body.timings) {
    await layoutService.getComposition(i.composition);
    i.startTime = utcTime(i.startTime, timezone);
    i.endTime = utcTime(i.endTime, timezone);
  }

  let data = {
    name: body.name,
    timings: body.timings,
    dates: [new Date()],
  };

  const subvendor = await Vendor.findById(vendorId).lean();
  if (subvendor.vendor) vendorId = subvendor.vendor;

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
  const subvendor = await Vendor.findById(vendorId).lean();
  if (subvendor.vendor) vendorId = subvendor.vendor;

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
  const subvendor = await Vendor.findById(vendorId).lean();
  if (subvendor.vendor) vendorId = subvendor.vendor;

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
  const subvendor = await Vendor.findById(vendorId).lean();
  let schedule;

  if (subvendor.vendor) vendorId = subvendor.vendor;

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
  const vendor = await Vendor.findById(vendorId).lean();

  let data = {
    isDeleted: false,
    createdBy: vendorId,
  };

  if (vendor.vendor) data.createdBy = vendor.vendor;

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

  const vendor = await Vendor.findById(vendorId).lean();

  const createdBy = vendor.vendor ?? vendorId;

  const quickplay = await Quickplay.create({
    createdBy,
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

    emit(screen.device?.deviceToken, contentPlaying);
    emit(screen.device?.deviceToken, contentPlaying, "", body.type);
  }

  return quickplay;
};

export const deleteQuickplay = async (createdBy, _id) => {
  const subvendor = await Vendor.findById(createdBy).lean();
  if (subvendor.vendor) createdBy = subvendor.vendor;

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
  const subvendor = await Vendor.findById(vendor).lean();

  let data = {
    vendor,
    isDeleted: false,
  };

  if (subvendor.vendor) data.vendor = subvendor.vendor;

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

  // const defaultComp = await Defaults.create({
  //   vendor,
  //   composition: composition._id,
  //   screens: body.screens,
  // });

  for (const _id of body.screens) {
    const defaultComposition = {
      media: composition,
      duration: 600,
      type: "composition",
    };

    defaultComposition.media.isDefault = true;

    const [screen, layout] = await Promise.all([
      Screen.findOneAndUpdate(
        { _id, isDeleted: false },
        { $set: { defaultComposition } },
        { new: 1 }
      )
        .populate({ path: "device" })
        .lean(),
      Layout.findOne({ _id: defaultComposition.media.layout }).lean(),
    ]);

    if (!screen) {
      throw new AuthFailedError(
        ERROR_MESSAGES.SCREEN_NOT_FOUND,
        STATUS_CODES.ACTION_FAILED
      );
    }

    defaultComposition.media.layout = layout;

    if (screen.device) {
      emit(screen?.device?.deviceToken, defaultComposition);
      console.log("runinngggg emit");
    }
    displayService.settings(SCREEN_SETTINGS.RELOAD, _id);
  }
};

export const editDefaultComposition = async (vendor, body) => {
  const defaultComp = await Defaults.findOneAndUpdate(
    {
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

export const assignScreens = async (vendorId, body) => {
  const [schedule, vendor] = await Promise.all([
    Schedule.findOne({
      _id: body.scheduleId,
      isDeleted: false,
    }).lean(),
    Vendor.findById(vendorId).lean(),
  ]);

  if (vendor.role !== "ADMIN" && !vendor.roles[vendor.role]["SCHEDULE"].edit) {
    throw new AuthFailedError(
      ERROR_MESSAGES.PERMISSION_DENIED,
      STATUS_CODES.FORBIDDEN
    );
  }

  if (!schedule) {
    throw new AuthFailedError(
      ERROR_MESSAGES.SCHEDULE_NOT_FOUND,
      STATUS_CODES.ACTION_FAILED
    );
  }

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
