"use strict";
const jsep = require("jsep");

function replaceCode(originalConcat) {
  let result = "";
  let previousState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false,
    inFunctionCall: false
  };
  let currentState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false,
    inFunctionCall: false
  };
  for (let i = 0; i < originalConcat.length; i++) {
    previousState = currentState;
    currentState = {
      inString: previousState.inString,
      openingString: false,
      closingString: false,
      inCode: previousState.inCode,
      inJoiningCode: previousState.inJoiningCode,
      char: originalConcat[i],
      lastChar: i === originalConcat.length - 1,
      inFunctionCall: previousState.inFunctionCall
    };
    if (currentState.char === "\"") {
      currentState.inString = true;
      //currentState.inCode = false;
      currentState.inJoiningCode = false;
      if (previousState.inString) {
        currentState.closingString = true;
      } else {
        currentState.openingString = true;
      }
    }

    if (previousState.closingString) {
      currentState.inString = false;
      currentState.inCode = false;
      currentState.inJoiningCode = false;
    }

    if (!currentState.inString) {
      if (!currentState.inFunctionCall && (currentState.char === " " || currentState.char === "+")) {
        currentState.inJoiningCode = true;
        currentState.inCode = false;
      } else {
        if (currentState.char === "(") {
          currentState.inFunctionCall = true;
        }
        if (currentState.char === ")") {
          currentState.inFunctionCall = false;
        }
        currentState.inJoiningCode = false;
        currentState.inCode = true;
      }
    }

    // console.log(currentState.char);
    // console.log(currentState.inCode);

    if (i === 0) {
      result += "`";
    }

    if (currentState.inCode && !previousState.inCode) {
      result += "${";
    }

    if (!currentState.inJoiningCode && ((!currentState.closingString && !currentState.openingString) || currentState.inCode)) {
      result += currentState.char;
    }

    if ((!currentState.inCode || currentState.lastChar) && previousState.inCode) {
      result += "}";
    }

    if (i === originalConcat.length - 1) {
      result += "`";
    }
  }
  return result;
}

function findStringConcatenations(content) {
  let results = [];
  const lines = content.split("\n");
  lines.forEach((line) => {
    let lineResults = findAssignments(line).concat(findFunctionParams(line)).filter((assignment) => {
      return assignment.match(/(\+\s?")|("\s?\+)/gi);
    });

    const returnValues = findReturnValues(line).filter((returnValue) => {
      for (let i = 0; i < lineResults.length; i++) { // Exclude return values which are already handled by assignments or function calls
        if (returnValue.indexOf(lineResults[i]) > -1) {
          return false;
        }
      }

      return returnValue.match(/(\+\s?")|("\s?\+)/gi);
    });
    lineResults = lineResults.concat(returnValues);
    results = results.concat(lineResults);
  });

  return results;
}

function findAssignments(content) {
  const results = [];
  let previousState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false,
    inFunctionCall: false,
    inAssignment: false
  };
  let currentState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false,
    inFunctionCall: false,
    inAssignment: false
  };

  let startOfAssignment = -1;

  for (let i = 0; i < content.length; i++) {
    previousState = currentState;
    currentState = {
      inString: previousState.inString,
      openingString: false,
      closingString: false,
      inCode: previousState.inCode,
      inJoiningCode: previousState.inJoiningCode,
      char: content[i],
      lastChar: i === content.length - 1,
      inFunctionCall: previousState.inFunctionCall,
      inAssignment: previousState.inAssignment
    };

    if (currentState.char === "\"") {
      currentState.inString = true;
      currentState.inCode = false;
      currentState.inJoiningCode = false;
      if (previousState.inString) {
        currentState.closingString = true;
      } else {
        currentState.openingString = true;
      }
    }

    if (previousState.closingString) {
      currentState.inString = false;
      currentState.inCode = false;
      currentState.inJoiningCode = false;
    }

    if ((currentState.char === "=" || currentState.char === ":") && !currentState.inString) { // TODO: Check not in string
      currentState.inAssignment = true;
      startOfAssignment = i;
    }

    if ((currentState.char === ";" || currentState.char === "}" || currentState.lastChar) && !currentState.inString && startOfAssignment > -1) { // TODO: Check not in string
      currentState.inAssignment = false;
      let endIndex = i;
      if (currentState.lastChar && currentState.char !== ";" && currentState.char !== "}") {
        endIndex = content.length;
      }
      results.push(content.slice(startOfAssignment + 1, endIndex).trim());
      startOfAssignment = -1;
    }
  }

  return results;
}

function findFunctionParams(content) {
  const results = [];
  let previousState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false,
    inFunctionCall: false,
    inAssignment: false
  };
  let currentState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false,
    inFunctionCall: false,
    inAssignment: false
  };

  let startOfParameter = -1;
  let openParenthesis = 0;

  for (let i = 0; i < content.length; i++) {
    previousState = currentState;
    currentState = {
      inString: previousState.inString,
      openingString: false,
      closingString: false,
      inCode: previousState.inCode,
      inJoiningCode: previousState.inJoiningCode,
      char: content[i],
      lastChar: i === content.length - 1,
      inFunctionCall: previousState.inFunctionCall,
      inAssignment: previousState.inAssignment
    };

    if (currentState.char === "\"") {
      currentState.inString = true;
      currentState.inCode = false;
      currentState.inJoiningCode = false;
      if (previousState.inString) {
        currentState.closingString = true;
      } else {
        currentState.openingString = true;
      }
    }

    if (previousState.closingString) {
      currentState.inString = false;
      currentState.inCode = false;
      currentState.inJoiningCode = false;
    }

    if (!currentState.inString) {
      if (!currentState.inFunctionCall && (currentState.char === " " || currentState.char === "+")) {
        currentState.inJoiningCode = true;
        currentState.inCode = false;
      } else {
        if (currentState.char === "(") {
          currentState.inFunctionCall = true;
          openParenthesis++;
          if (startOfParameter === -1) {
            startOfParameter = i;
          }
        }
        if (currentState.char === ")") {
          currentState.inFunctionCall = false;
          if (startOfParameter > -1 && openParenthesis === 1) {
            const candidate = content.slice(startOfParameter + 1, i).trim();
            try {
              const parsedCandidate = jsep(candidate);
              if (parsedCandidate.type === "BinaryExpression") {
                results.push(candidate);
                startOfParameter = -1;
              } else {
                // That's not a binary expression! Let's see if we can find one inside it.
                const nested = findFunctionParams(candidate);
                nested.forEach((n) => {
                  results.push(n);
                });
              }
            } catch (err) {} // eslint-disable-line no-empty
          }
          openParenthesis--;
        }
        if (currentState.char === ",") {
          if (startOfParameter > -1 && openParenthesis === 1) {
            results.push(content.slice(startOfParameter + 1, i).trim());
            startOfParameter = i;
          }
        }
        currentState.inJoiningCode = false;
        currentState.inCode = true;
      }
    }
  }

  return results;
}

function findReturnValues(content) {
  const matches = content.match(/(?=return\s*).*(?=;)/gi);
  if (!matches) {
    return [];
  }
  return matches.map((match) => {
    return match.replace(/^return\s*/gi, "");
  });
}

module.exports = {
  replaceCode: replaceCode,
  findStringConcatenations: findStringConcatenations
};
