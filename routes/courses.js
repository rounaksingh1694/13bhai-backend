var express = require("express");
var router = express.Router();
const cors = require("cors");

const {
	getCourseraCourses,
	getUdemyCourses,
	getSkillShareCourses,
	getCourses,
} = require("../controllers/courses");
router.get(
	"/courses",
	cors(),
	// getUdemyCourses,
	getCourseraCourses,
	getSkillShareCourses,
	getCourses
);

module.exports = router;
