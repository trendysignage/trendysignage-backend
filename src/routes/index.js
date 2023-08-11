import express from "express";

import adminAuthRoute from "./admin/authRoutes.js";
import adminResellerRoute from "./admin/resellerRoutes.js";
import adminVendorRoute from "./admin/vendorRoutes.js";
import deviceRoute from "./device/deviceRoutes.js";
import appRoute from "./vendor/appRoute.js";
import vendorAuth from "./vendor/authRoutes.js";
import displayRoute from "./vendor/displayRoutes.js";
import layoutRoute from "./vendor/layoutRoutes.js";
import profileRoute from "./vendor/profileRoutes.js";
import pushRoute from "./vendor/pushRoutes.js";

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
    path: "/vendor/apps",
    route: appRoute,
  },
  {
    path: "/admin/auth",
    route: adminAuthRoute,
  },
  {
    path: "/admin/vendor",
    route: adminVendorRoute,
  },
  {
    path: "/admin/reseller",
    route: adminResellerRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
