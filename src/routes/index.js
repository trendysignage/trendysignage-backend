const express = require("express");

const display = require("./vendor/displayRoutes");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/display",
    route: display,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
