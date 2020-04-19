"use strict";
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

module.exports = {
  "0 */24 * * *": async (date) => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=fr-FR"],
    });
    const page = await browser.newPage();
    await page.goto(
      "https://fr.linkedin.com/jobs/search?keywords=React.js&location=R%C3%A9gion%20de%20la%20baie%20de%20San%20Francisco&trk=guest_job_search_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0&f_TP=1"

    );
    let content = await page.content();

    // 1 - Load the HTML
    const $ = cheerio.load(content);

    // 2 - Select the HTML element you need
    // For the tutorial case, we need to select the list of jobs and for each element, we will
    // create a new job object to store it in the database with Strapi.
    $("li.result-card.job-result-card").each((i, el) => {
      if (Array.isArray(el.children)) {
        const job = {
          title: el.children[0].children[0].children[0].data,
          linkedinUrl: el.children[0].attribs.href,
          companyName:
            el.children[2].children[1].children[0].data ||
            el.children[2].children[1].children[0].children[0].data,
          descriptionSnippet:
            el.children[2].children[2].children[1].children[0].data,
          timeFromNow: el.children[2].children[2].children[2].children[0].data,
        };

        // 4 - Store the job with the Strapi global.
        strapi.services.job.create(job);
      }
    });

    // 5 - Close the browser
    browser.close();
  },
};
