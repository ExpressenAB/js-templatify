"use strict";
const chai = require("chai");
const fs = require("fs.extra");
const exec = require("child_process").exec;
const helpers = require("../helpers");
const inputDir = "./test/input";
const outputDir = "./test/output";
const tempDir = "./test/tmp";
chai.should();

const files = fs.readdirSync(inputDir);

describe("templatify", () => {
  before(copyFiles);

  files.forEach((file) => {
    it("should produce the expected output", (done) => {
      const expected = fs.readFileSync(`${outputDir}/${file}`, {encoding: "utf-8"});
      exec(`node ./templatify.js ${tempDir}/${file}`, (err) => {
        if (err) {
          return done(err);
        }
        const actual = fs.readFileSync(`${tempDir}/${file}`, {encoding: "utf-8"});
        actual.should.equal(expected);
        done();
      });
    });
  });
});

describe("replaceCode", () => {
  it("1", () => {
    const original = "\"hello \" + name";
    const result = helpers.replaceCode(original);
    result.should.equal("`hello ${name}`");
  });

  it("2", () => {
    const original = "\"hello \"+name";
    const result = helpers.replaceCode(original);
    result.should.equal("`hello ${name}`");
  });

  it("3", () => {
    const original = "name + \" is your name\"";
    const result = helpers.replaceCode(original);
    result.should.equal("`${name} is your name`");
  });

  it("4", () => {
    const original = "\"Hi there \" + name + \", how are you?\"";
    const result = helpers.replaceCode(original);
    result.should.equal("`Hi there ${name}, how are you?`");
  });
});

function copyFiles(callback) {
  if (fs.existsSync(tempDir)) {
      fs.rmrfSync(tempDir);
  }

  fs.mkdirSync(tempDir);

  fs.copyRecursive(inputDir, tempDir, (err) => {
    if (err) {
      return callback(err);
    }
    callback();
  });
}
