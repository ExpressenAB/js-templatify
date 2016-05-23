"use strict";
const fs = require("fs");
const path = process.argv[2];
const helpers = require("./helpers");
let contents = fs.readFileSync(path, "utf-8");

const concats = findStringConcatenations(contents);

concats.forEach((original) => {
  let modified = original;
  modified = helpers.replaceCode(modified);

  contents = contents.replace(original, modified);
});

fs.writeFileSync(path, contents, "utf-8");

function findStringConcatenations(content) {
  const stringPattern = /(?=\(|=\s*)((.*\s?\+\s?)".*\")|(".*\"(\s?\+.*))(?=\);|;)/gmi;
  return content.match(stringPattern).map((match) => {
    return match.replace(/^=\s?/, "").replace(/^\(/, "");
  });
}
