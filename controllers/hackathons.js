const browserlessFactory = require("browserless");
var { JSDOM } = require("jsdom");
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { createContext } = browserlessFactory({
	timeout: 25000,
	lossyDeviceName: true,
	ignoreHTTPSErrors: true,
});

var cachedDevfolioHackathons = [];

var cachedDevPostHackathons = []; //sometimes the code is able to scrape and sometimes not that is why here is a cached list whose value gets replaced everytime the code scrapes >1 hackathon

exports.getDevfolioHackathons = (req, res, next) => {
	var query = req.query.q;
	var link = "https://devfolio.co/hackathons";

	scrapeDevFolio(link);
	function scrapeDevFolio(link) {
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
			var document = doc.window.document;
			var hackathons = document.querySelectorAll(
				".sc-hjQCSK.sc-bSakgD.iIfzrK.jOSBEK"
			);
			var list = [];
			for (let index = 0; index < hackathons.length; index++) {
				const hackathon = hackathons[index];
				var title = hackathon.getElementsByTagName("h5")[0].textContent;

				var description = "";

				var childrens = hackathon.children;

				for (let j = 0; j < childrens.length; j++) {
					const element = childrens[j];

					description += element.textContent + "    ";
				}
				var url = hackathon.getElementsByTagName("a")[0].href;
				var json = {
					title: title,
					description: description,
					url: url,
				};
				list.push(json);
			}
			if (list.length > 0) cachedDevfolioHackathons = list;

			var hackathonJson = {
				platformName: "Devfolio",
				hackathonList: cachedDevfolioHackathons,
			};
			req.devFolioHackathons = hackathonJson;
			next();
		}
		getSerializedData();
	}
};

exports.getDevpostHackathons = (req, res, next) => {
	var query = req.query.q;
	var link = "https://devpost.com/hackathons";

	scrapeDevPost(link);
	function scrapeDevPost(link) {
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
			var document = doc.window.document;
			var hackathons = document.querySelectorAll(".hackathon-tile.clearfix");
			var list = [];
			for (let index = 0; index < hackathons.length; index++) {
				const hackathon = hackathons[index];
				var title = hackathon.getElementsByTagName("h3")[0].textContent;
				var description = "";
				var childrens = hackathon.querySelector(".main-content").children;

				for (let j = 0; j < childrens.length; j++) {
					const element = childrens[j];
					description += element.textContent + "  ";
				}

				var url = hackathon.getElementsByTagName("a")[0].href;
				var json = {
					title: title,
					description: description,
					url: url,
				};
				list.push(json);
			}

			if (list.length > 0) cachedDevPostHackathons = list;

			var hackathonJson = {
				platformName: "Devpost",
				hackathonList: cachedDevPostHackathons,
			};
			req.devpostHackathons = hackathonJson;
			next();
		}
		getSerializedData();
	}
};

exports.getHackathons = (req, res) => {
	res.status(200).json([req.devFolioHackathons, req.devpostHackathons]);
};
