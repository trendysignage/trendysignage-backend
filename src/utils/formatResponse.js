const momentTz = require("moment-timezone");
const moment = require("moment");

const localtime = (DateTime, timeZone) => {
  const localDt = momentTz.tz(DateTime, timeZone).format("YYYY-MM-DDTHH:mm:ss");
  return localDt;
};

const utcTime = (DateTime, timeZone) => {
  const utctime =
    momentTz.tz(DateTime, timeZone).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
  return new Date(utctime);
};

const converStringToDate = (date) => {
  return moment(date + "Z", "DD-MM-YYYY" + "Z").toDate();
};

module.exports = {
  converStringToDate,
  localtime,
  utcTime,
};
