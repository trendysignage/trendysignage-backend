import express from "express";
import displayRoute from "./vendor/displayRoutes.js";
import deviceRoute from "./device/deviceRoutes.js";
import vendorAuth from "./vendor/authRoutes.js";

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
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
