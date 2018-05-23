#!/usr/bin/env node
const argv = require("yargs").argv;
const fs = require("fs-extra");

const captureScreenshots = require('.');

const urlsPath = path.resolve(__dirname, argv.urls || "urls.json");
const urls = await fs.readJson(URLS_PATH);


try {
  captureScreenshots(urls, argv.folder);
} catch (e) {
  console.log("error", e);
}


