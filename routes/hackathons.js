var express = require("express");
var router = express.Router();

const {
  getDevfolioHackathons,
  getDevpostHackathons,
  getHackathons,
} = require("../controllers/hackathons");

router.get(
  "/hackathons",

  getDevpostHackathons,
  getDevfolioHackathons,
  getHackathons
);
module.exports = router;
