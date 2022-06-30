const browserlessFactory = require("browserless");

var { JSDOM } = require("jsdom");
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { createContext } = browserlessFactory({
	timeout: 25000,
	lossyDeviceName: true,
	ignoreHTTPSErrors: true,
});
require("dotenv").config();

exports.getCourseraCourses = (req, res, next) => {
	var query = req.query.q;
	var link = "https://www.coursera.org/search?query=" + query;
	async function getSerializedData() {
		const browserless = await createContext({ retry: 1 });
		const serialize = browserless.evaluate(
			(page) => page.evaluate(() => document.body.innerHTML),
			{
				waitUntil: "domcontentloaded",
			}
		);

		var serializedHtml = await serialize(link);

		var doc = new JSDOM(serializedHtml, {
			url: link,
		});

		const document = doc.window.document;

		var courseCards = document.getElementsByClassName("css-1j8ushu");
		var list = [];
		for (const key in courseCards) {
			if (Object.hasOwnProperty.call(courseCards, key)) {
				const courseCard = courseCards[key];
				if (courseCard) {
					var url = courseCard.getElementsByTagName("a")[0].href;
					var title = courseCard.querySelector(".css-cru2ji").textContent;
					var difficultyLevel = courseCard.querySelectorAll(
						".cds-1.css-1cxz0bb.cds-3"
					)[2];
					var imgUrl = courseCard
						.querySelector(".css-17z2etb")
						.getElementsByTagName("img")[0].src;
					var usp = courseCard.querySelector(".css-pn23ng");
					var author = courseCard.querySelector(".css-1cxz0bb");
				}
				var json = {
					title: title,
					difficultyLevel: difficultyLevel ? difficultyLevel.textContent : "",
					usp: usp ? usp.textContent : "",
					author: author ? author.textContent : "",
					imgUrl: imgUrl ? imgUrl : "",
					url: url ? url : "",
				};
				list.push(json);
			}
		}
		var courseJson = {
			platformName: "Coursera",
			courses: list,
		};
		req.courseraCourses = courseJson;
		next();
	}

	getSerializedData();
};

exports.getSkillShareCourses = (req, res, next) => {
	var query = req.query.q;
	var link =
		"https://www.skillshare.com/search?query=" + query.replace(" ", "+");
	async function getSerializedData() {
		const browserless = await createContext({ retry: 2 });
		const serialize = browserless.evaluate(
			(page) => page.evaluate(() => document.body.innerHTML),
			{
				waitUntil: "domcontentloaded",
			}
		);

		var serializedHtml = await serialize(link);

		var doc = new JSDOM(serializedHtml, {
			url: link,
		});

		const document = doc.window.document;

		var courseCards = document.getElementsByClassName(
			"class-card sc-hzDkRC lprvFn"
		);
		var list = [];
		for (const key in courseCards) {
			if (Object.hasOwnProperty.call(courseCards, key)) {
				const courseCard = courseCards[key];
				if (courseCard) {
					var url = courseCard.getElementsByTagName("a")[0].href;
					var title = courseCard.querySelector(".title").textContent;
					var imgUrl = courseCard.querySelector(".thumbnail-img-holder").style
						.backgroundImage;
					var usp = courseCard.querySelector(".stats").textContent;
					var author =
						courseCard.querySelector(".user-information").textContent;
				}

				imgUrl = imgUrl.replace("url(", "").replace(")", "");
				usp = usp.replace("students", "students ");
				var json = {
					title: title,
					difficultyLevel: "",
					usp: usp ? usp : "",
					author: author ? author : "",
					imgUrl: imgUrl ? imgUrl : "",
					url: url ? url : "",
				};
				list.push(json);
			}
		}
		var courseJson = {
			platformName: "Skillshare",
			courses: list,
		};
		req.skillShareCourses = courseJson;
		next();
	}

	getSerializedData();
};

exports.getUdemyCourses = (req, res, next) => {
	var query = req.query.q;
	fetchCourses(query);
	async function fetchCourses(query) {
		var link =
			"https://www.udemy.com/api-2.0/courses/?page_size=50&search=" + query;

		var obj = {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${process.env.UDEMY_TOKEN}`,
				"Content-Type": "application/json",
			},
		};

		const response = await fetch(link, obj);
		const json = await response.json();
		var courses = json.results;
		var list = [];
		for (let index = 0; index < courses.length; index++) {
			const course = courses[index];
			var title = course.title;
			var author = "";
			for (let i = 0; i < course.visible_instructors.length; i++) {
				const element = course.visible_instructors[i];
				if (i != course.visible_instructors.length - 1)
					author += element.display_name + " & ";
				else author += element.display_name;
			}
			var price = course.price;
			var usp = course.headline;
			var imgUrl = course.image_240x135;
			var url = "https://www.udemy.com" + course.url;
			var item_json = {
				title: title,
				price: price,
				usp: usp ? usp : "",
				author: author ? author : "",
				imgUrl: imgUrl ? imgUrl : "",
				url: url ? url : "",
			};
			list.push(item_json);
		}

		var courseJson = {
			platformName: "Udemy",
			courses: list,
		};
		req.udemyCourses = courseJson;
		next();
	}
};

exports.getCourses = (req, res) => {
	res
		.status(200)
		.json([req.udemyCourses, req.skillShareCourses, req.courseraCourses]);
};
