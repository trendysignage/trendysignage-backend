const express = require("express");
// const userAuth = require("./");
// const profile = require("./app/profileRoutes");
// const home = require("./app/homepageRoutes");

const adminAuth = require("./admin/auth");
// const adminUser = require("./admin/user.routes");

// const staticRoutes = require("./static.routes");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/admin/auth",
    route: adminAuth,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
