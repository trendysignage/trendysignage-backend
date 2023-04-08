import express from "express";
import display from "./vendor/displayRoutes.js";
import media from "./vendor/mediaRoutes.js";
// import vendorAuth from "./vendor/authRoutes";

const router = express.Router();

const defaultRoutes = [
  //   {
  //     path: "/user",
  //     route: vendorAuth,
  //   },
  {
    path: "/vendor/display",
    route: display,
  },
  {
    path: "/vendor/media",
    route: media,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
