import express from "express";
import displayRoute from "./vendor/displayRoutes.js";
import deviceRoute from "./device/deviceRoutes.js";
// import vendorAuth from "./vendor/authRoutes";

const router = express.Router();

const defaultRoutes = [
  //   {
  //     path: "/user",
  //     route: vendorAuth,
  //   },
  {
    path: "/vendor/display",
    route: displayRoute,
  },
  {
    path: "/auth/device",
    route: deviceRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
