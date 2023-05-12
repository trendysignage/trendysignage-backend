import express from "express";

import displayRoute from "./vendor/displayRoutes.js";
import deviceRoute from "./device/deviceRoutes.js";
import vendorAuth from "./vendor/authRoutes.js";
import profileRoute from "./vendor/profileRoutes.js";
import layoutRoute from "./vendor/layoutRoutes.js";
import pushRoute from "./vendor/pushRoutes.js";
import adminAuthRoute from "./admin/authRoutes.js";
import adminVendorRoute from "./admin/vendorRoutes.js";

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
  {
    path: "/vendor/layouts",
    route: layoutRoute,
  },
  {
    path: "/vendor/push",
    route: pushRoute,
  },
  {
    path: "/admin/auth",
    route: adminAuthRoute,
  },
  {
    path: "/admin/vendor",
    route: adminVendorRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
