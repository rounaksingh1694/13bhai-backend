var { JSDOM } = require("jsdom");
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { parse } = require("rss-to-json");

exports.getJobsFromFreelanceCom = (req, res, next) => {
	var searchQuery = req.query.q;

	var link = "https://www.freelancer.com/jobs/?keyword=" + searchQuery;

	async function scrapeFreelancerCom(link) {
		const response = await fetch(link);
		const body = await response.text();

		var doc = new JSDOM(body, {
			url: link,
		});

		const document = doc.window.document;

		var projectList = document.getElementsByClassName("JobSearchCard-item ");
		var list = [];
		for (const key in projectList) {
			if (Object.hasOwnProperty.call(projectList, key)) {
				const project = projectList[key];
				if (project) {
					var title = project.querySelector(
						".JobSearchCard-primary-heading-link"
					);

					var descr = project.querySelector(
						".JobSearchCard-primary-description"
					);
					var budget = project.querySelector(".JobSearchCard-secondary-price");

					if (title && descr && budget)
						list.push({
							title: title.innerHTML.replace(/\s\s+/g, " "),
							description: descr.textContent.replace(/\s\s+/g, " "),
							budget: budget.textContent.replace(/\s\s+/g, " "),
							url: title.href,
						});
				}
			}
		}
		var json = {
			platformName: "freelancer.com",
			jobList: list,
		};
		req.freelancecomjobs = json;
		next();
	}
	try {
		scrapeFreelancerCom(link);
	} catch (e) {
		req.freelancecomjobs = {
			platformName: "freelancer.com",
			jobList: [],
		};
		next();
	}
};

exports.getJobsFromUpwork = (req, res, next) => {
	var searchQuery = req.query.q;

	var link = "https://www.upwork.com/ab/feed/jobs/rss?q=" + searchQuery;
	// async await
	async function scrapeUpwork(link) {
		try {
			var rss = await parse(link);
			var projectList = [];

			for (const key in rss.items) {
				if (Object.hasOwnProperty.call(rss.items, key)) {
					const { title, description, link } = rss.items[key];
					projectList.push({
						title: title,
						description: description,
						url: link,
					});
				}
			}

			var json = {
				platformName: "upwork",
				jobList: projectList,
			};

			req.upworkJobs = json;
			next();
		} catch (e) {
			req.upworkJobs = {
				platformName: "upwork",
				jobList: [],
			};
			next();
		}
	}
	try {
		scrapeUpwork(link);
	} catch (e) {
		req.upworkJobs = {
			platformName: "upwork",
			jobList: [],
		};
		next();
	}
};

exports.getJobsFromPeoplePerHour = (req, res, next) => {
	var searchQuery = req.query.q;

	var link =
		"https://www.peopleperhour.com/freelance-" +
		searchQuery.replace(" ", "-") +
		"-jobs";

	async function scrapePeoplePerHour(link) {
		const response = await fetch(link);
		const body = await response.text();

		var doc = new JSDOM(body, {
			url: link,
		});

		const document = doc.window.document;

		var projectList = document.getElementsByClassName("list__item⤍List⤚2ytmm");
		var list = [];
		for (const key in projectList) {
			if (Object.hasOwnProperty.call(projectList, key)) {
				const project = projectList[key];
				if (project) {
					var title = project.querySelector(".item__url⤍ListItem⤚20ULx");
					var budget = project.querySelector(".item__budget⤍ListItem⤚3P7Zd");

					if (title && budget)
						list.push({
							title: title.innerHTML.replace(/\s\s+/g, " "),
							url: title.href,
							budget: budget.textContent.replace(/\s\s+/g, " "),
						});
				}
			}
		}

		var json = {
			platformName: "peopleperhour",
			jobList: list,
		};
		req.peopleperhourjobs = json;

		next();
	}

	try {
		scrapePeoplePerHour(link);
	} catch (e) {
		req.peopleperhourjobs = {
			platformName: "peopleperhour",
			jobList: [],
		};
		next();
	}
};

exports.getJobs = (req, res) => {
	res
		.status(200)
		.json([req.upworkJobs, req.peopleperhourjobs, req.freelancecomjobs]);
};
