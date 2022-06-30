const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const jobRoutes = require("./routes/jobs");
const hackathonRoutes = require("./routes/hackathons");
const coursesRoutes = require("./routes/courses");

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.options("/coures", cors());

app.use("/api", jobRoutes);
app.use("/api", hackathonRoutes);
app.use("/api", coursesRoutes);

const port = 8000;

app.listen(port, () => {
	console.log(`app is running at ${port}`);
});
