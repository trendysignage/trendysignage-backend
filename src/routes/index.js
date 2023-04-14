import express from "express";

import displayRoute from "./vendor/displayRoutes.js";
import deviceRoute from "./device/deviceRoutes.js";
import vendorAuth from "./vendor/authRoutes.js";
import profileRoute from "./vendor/profileRoutes.js";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/vendor/auth",
    route: vendorAuth,
  },
  {
    path: "/vendor/display",
    route: displayRoute,
  },
  {
    path: "/device/auth",
    route: deviceRoute,
  },
  {
    path: "/vendor/profile",
    route: profileRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
