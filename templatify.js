"use strict";
/* eslint-disable no-console */
const fs = require("fs");
const path = process.argv[2];
const helpers = require("./helpers");
let contents = fs.readFileSync(path, "utf-8");

const concats = helpers.findStringConcatenations(contents);

concats.forEach((original) => {
  let modified = original;
  modified = helpers.replaceCode(modified);
  console.log("REPLACED:\t\x1b[36m%s\x1b[0m", original);  //cyan
  console.log("WITH:\t\t\x1b[33m%s\x1b[0m", modified);  //yellow
  console.log();
  contents = contents.replace(original, modified);
});

fs.writeFileSync(path, contents, "utf-8");
