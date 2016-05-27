"use strict";
const chai = require("chai");
const helpers = require("../helpers");
chai.should();

describe("helpers.replaceCode", () => {
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

  it("should replace '\"Hello there \" + doStuff(a, b)' with template string", () => {
    const original = "\"Hello there \" + doStuff(a, b)";
    const result = helpers.replaceCode(original);
    result.should.equal("`Hello there ${doStuff(a, b)}`");
  });

  it("should replace 'myVar + someFunc(\"hello\")' with template string", () => {
    const original = "myVar + someFunc(\"hello\")";
    const result = helpers.replaceCode(original);
    result.should.equal("`${myVar}${someFunc(\"hello\")}`");
  });

  it("should replace 'req.protocol + \"://\" + req.get(\"host\")' with template string", () => {
    const original = "req.protocol + \"://\" + req.get(\"host\")";
    const result = helpers.replaceCode(original);
    result.should.equal("`${req.protocol}://${req.get(\"host\")}`");
  });
});

describe("helpers.findStringConcatenations", () => {
  it("should return [] for 'var a = b;'", () => {
    const result = helpers.findStringConcatenations("var a = b;");
    result.should.be.empty;
  });

  it("should return [] for 'console.log(myVar);'", () => {
    const result = helpers.findStringConcatenations("console.log(myVar);");
    result.should.be.empty;
  });

  it("should return [] for 'return myVar;'", () => {
    const result = helpers.findStringConcatenations("return myVar;");
    result.should.be.empty;
  });

  it("should return [] for 'if (new Date().getHours() < 10) {\ngreeting = \"Good morning\";\n}'", () => {
    const result = helpers.findStringConcatenations("if (new Date().getHours() < 10) {\ngreeting = \"Good morning\";\n}");
    result.should.be.empty;
  });

  it("should return [] for 'typeof reference === \"string\"'", () => {
    const result = helpers.findStringConcatenations("typeof reference === \"string\"");
    result.should.be.empty;
  });

  it("should return [] for 'return (Object.keys(query).length > 0) ? \"?\" + qs.unescape(qs.stringify(query)) : \"\";' as it doesn't handle terniary expressions", () => {
    const result = helpers.findStringConcatenations("return (Object.keys(query).length > 0) ? \"?\" + qs.unescape(qs.stringify(query)) : \"\";");
    result.should.be.empty;
  });

  const assertions = [
    { input: "var myVar = \"Hello there \" + name;", expected: "\"Hello there \" + name" },
    { input: "var myVar = \"Hello there \"+name;", expected: "\"Hello there \"+name" },
    { input: "var myVar = name + \" is your name\";", expected: "name + \" is your name\"" },
    { input: "var myVar = \"Hello there \" + name + \"!\";", expected: "\"Hello there \" + name + \"!\"" },
    { input: "var myVar = \"Hello there \" + name + \"! I'm: \" + me;", expected: "\"Hello there \" + name + \"! I'm: \" + me" },
    { input: "var myVar = name + \", nice to meet you. I'm \" + me + \".\";", expected: "name + \", nice to meet you. I'm \" + me + \".\"" },
    { input: "var myVar = \"Hello there \" + getName();", expected: "\"Hello there \" + getName()" },
    { input: "var myVar = \"Hello there \" + getName(someVar);", expected: "\"Hello there \" + getName(someVar)" },
    { input: "var myVar = \"Hello there \" + getName(someVar, someOtherVar);", expected: "\"Hello there \" + getName(someVar, someOtherVar)" },
    { input: "var myVar = getName() + \" is your name\";", expected: "getName() + \" is your name\"" },
    { input: "var myVar = \"Greetings; \" + name;", expected: "\"Greetings; \" + name" },
    { input: "var myVar = \"You = \" + name;", expected: "\"You = \" + name" },
    { input: "var myVar = \"Hello \" + name + \", how are you?\";", expected: "\"Hello \" + name + \", how are you?\"" },
    { input: "console.log(\"Hello there \" + name);", expected: "\"Hello there \" + name" },
    { input: "console.log(\"Hello there \" + readName());", expected: "\"Hello there \" + readName()" },
    { input: "myFunc(\"Hello there \" + name, myVar);", expected: "\"Hello there \" + name" },
    { input: "myFunc(myVar, \"Hello there \" + name);", expected: "\"Hello there \" + name" },
    { input: "myFunc(\"Hello there, your name is: \" + name, myVar);", expected: "\"Hello there, your name is: \" + name" },
    { input: "myFunc(myVar, \"Hello there, your name is: \" + name);", expected: "\"Hello there, your name is: \" + name" },
    { input: "myFunc(\"nice \" + nesting(\"of \" + stuff), myVar);", expected: "\"nice \" + nesting(\"of \" + stuff)" },
    { input: "(myOtherFunc(\"Hello \" + name))", expected: "\"Hello \" + name" },
    { input: "res.setHeader(\"cache-control\", \"public, max-age=\" + maxAge(source, mapped));", expected: "\"public, max-age=\" + maxAge(source, mapped)" },
    { input: "var message = { greeting: \"Hello \" + name };", expected: "\"Hello \" + name" },
    { input: "var message = {\ngreeting: \"Hello \" + name\n};", expected: "\"Hello \" + name" },
    { input: "var message = {\nsomeProp: \"some value\",\ngreeting: \"Hello \" + name};", expected: "\"Hello \" + name" },
    { input: "return uppercase(\"Hello \" + name);", expected: "\"Hello \" + name" },
    { input: "return \"Hello \" + name;", expected: "\"Hello \" + name"},
    { input: "return req.protocol + \"://\" + req.get(\"host\");", expected: "req.protocol + \"://\" + req.get(\"host\")"}
  ];

  assertions.forEach((assertion) => {
    it(`should return ['${assertion.expected}'] for '${assertion.input}'`, () => {
      const result = helpers.findStringConcatenations(assertion.input);
      result.length.should.eql(1);
      result[0].should.equal(assertion.expected);
    });
  });
});
