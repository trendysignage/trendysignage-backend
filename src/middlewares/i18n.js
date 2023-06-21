import i18n from "i18n";
import path from "path";
const __dirname = path.resolve();

i18n.configure({
  locales: ["en", "hi"],
  defaultLocale: "en",
  cookie: "locale",
  directory: __dirname + "/src/middlewares/locales",
  directoryPermissions: "755",
  autoReload: true,
  updateFiles: true,
  objectNotation: true,
  api: {
    _: "_", //now req.__ becomes req.__
    __n: "__n", //and req.__n can be called as req.__n
  },
});

export default i18n;
