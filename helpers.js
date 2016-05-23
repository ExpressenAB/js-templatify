"use strict";

function replaceCode(originalConcat) {
  let result = "";
  let previousState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false
  };
  let currentState = {
    inString: false,
    openingString: false,
    closingString: false,
    inCode: false,
    inJoiningCode: false,
    char: undefined,
    lastChar: false
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
      lastChar: i === originalConcat.length - 1
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
      if (currentState.char === " " || currentState.char === "+") {
        currentState.inJoiningCode = true;
        currentState.inCode = false;
      } else {
        currentState.inJoiningCode = false;
        currentState.inCode = true;
      }
    }
    //console.log(currentState.char + " " +currentState.inJoiningCode);
    if (i === 0) {
      result += "`";
    }

    if (currentState.inCode && !previousState.inCode) {
      result += "${";
    }

    if (!currentState.inJoiningCode && !currentState.closingString && !currentState.openingString) {
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

module.exports = {
  replaceCode: replaceCode
};
