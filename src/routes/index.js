import express from "express";
import display from "./vendor/displayRoutes.js";
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
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
