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

  files.forEach((file, index) => {
    it(`should produce the expected output for file number ${index + 1}`, (done) => {
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
  it("should replace '\"hello \" + name' with template string", () => {
    const original = "\"hello \" + name";
    const result = helpers.replaceCode(original);
    result.should.equal("`hello ${name}`");
  });

  it("should replace '\"hello \"+name' with template string", () => {
    const original = "\"hello \"+name";
    const result = helpers.replaceCode(original);
    result.should.equal("`hello ${name}`");
  });

  it("should replace 'name + \" is your name\"' with template string", () => {
    const original = "name + \" is your name\"";
    const result = helpers.replaceCode(original);
    result.should.equal("`${name} is your name`");
  });

  it("should replace '\"Hi there \" + name + \", how are you?\"' with template string", () => {
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
