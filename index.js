const path = require("path");
const fs = require("fs-extra");
const isString = require("lodash.isstring");
const isObject = require("lodash.isobject");
const argv = require("yargs").argv;
const puppeteer = require("puppeteer");
const slugify = require("@sindresorhus/slugify");

const URLS_PATH = path.resolve(__dirname, argv.urls || "urls.json");
const SCREENSHOTS_FOLDER = path.resolve(__dirname, "screenshots");

const promiseSerial = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([])
  );

const processItem = item => {
  if (isString(item)) {
    return {
      url: item,
      folder: ""
    };
  }

  if (isObject(item)) {
    return item;
  }

  throw Error("item needs to be either a string or an object");
};

const captureScreenshots = async () => {
  await fs.ensureDir(SCREENSHOTS_FOLDER);
  const urls = await fs.readJson(URLS_PATH);

  const browser = await puppeteer.launch();

  const screenshotTasks = urls.map(item => async () => {
    const { url, folder } = processItem(item);
    const slug = slugify(url).slice(0, 30);
    await fs.ensureDir(path.resolve(SCREENSHOTS_FOLDER, folder));
    const screenshotPath = path.resolve(
      SCREENSHOTS_FOLDER,
      folder,
      `screenshot-${slug}.png`
    );
    const page = await browser.newPage();
    await page.setViewport({
      width: 1000,
      height: 600
    });
    await page.goto(url);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: "png"
    });
    await page.close();
  });

  await promiseSerial(screenshotTasks);

  await browser.close();
};

try {
  captureScreenshots();
} catch (e) {
  console.log("error", e);
}
