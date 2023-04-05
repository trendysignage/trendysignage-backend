const i18n = require("i18n");
i18n.configure({
  locales: ["en", "hi"],
  defaultLocale: "en",
  cookie: "locale",
  directory: __dirname + "/locales",
  directoryPermissions: "755",
  autoReload: true,
  updateFiles: true,
  objectNotation: true,
  api: {
    _: "_", //now req.__ becomes req.__
    __n: "__n", //and req.__n can be called as req.__n
  },
});
module.exports = i18n;
