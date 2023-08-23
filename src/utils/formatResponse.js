import moment from "moment";
import momentTz from "moment-timezone";

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

const formatVendor = (vendor) => {
  delete vendor.__v;
  delete vendor.password;
  delete vendor.screens;
  delete vendor.apps;
  delete vendor.userGroups;
  delete vendor.media;
  delete vendor.mediaReport;
  delete vendor.compositions;
  delete vendor.schedules;
  delete vendor.screens;
  delete vendor.groups;
  delete vendor.country;
  delete vendor.countryCode;
  delete vendor.phoneNumber;
  delete vendor.isDeleted;
  delete vendor.isEnabled;
};

const formatResellerVendor = (vendor) => {
  delete vendor.__v;
  delete vendor.password;
};

const formatAdmin = (admin) => {
  delete admin.__v;
  delete admin.password;
};

export {
  converStringToDate,
  formatAdmin,
  formatResellerVendor,
  formatVendor,
  localtime,
  utcTime,
};
