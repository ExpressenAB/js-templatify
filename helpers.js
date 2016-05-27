"use strict";
const acorn = require("acorn");

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
  const parsed = acorn.parse(content, { locations: true, allowReturnOutsideFunction: true });
  const nodes = findInNode(parsed);
  const extracted = nodes.map((node) => {
    return content.slice(node.start, node.end);
  });

  return extracted.filter((extractedConcat) => {
    return extractedConcat.indexOf("\n") === -1;
  });
}

function findInNode(node) {
  if (!node) {
    return [];
  }

  switch (node.type) {
      case "Program":
          return findInProgram(node);
      case "VariableDeclaration":
          return findInVariableDeclaration(node);
      case "VariableDeclarator":
          return findInVariableDeclarator(node);
      case "Literal":
          return [];
      case "BinaryExpression":
          return findInBinaryExpression(node);
      case "ExpressionStatement":
          return findInExpressionStatement(node);
      case "CallExpression":
          return findInCallExpression(node);
      case "ObjectExpression":
          return findInObjectExpression(node);
      case "Property":
          return findInProperty(node);
      case "ReturnStatement":
          return findInReturnStatement(node);
      case "FunctionDeclaration":
          return findInFunctionDeclaration(node);
      case "BlockStatement":
          return findInBlockStatement(node);
      case "IfStatement":
          return findInIfStatement(node);
      case "NewExpression":
          return findInNewExpression(node);
      case "ConditionalExpression":
          return findInConditionalExpression(node);
      case "ThrowStatement":
          return findInThrowStatement(node);
      default:
          return [];
  }
}

function findInProgram(node) {
  const values = node.body.map((bodyPart) => {
    return findInNode(bodyPart);
  });

  return [].concat.apply([], values);
}

function findInVariableDeclaration(node) {
  const values = node.declarations.map((declaration) => {
    return findInNode(declaration);
  });
  return [].concat.apply([], values);
}

function findInVariableDeclarator(node) {
  return findInNode(node.init);
}

function findInBinaryExpression(node) {
  if (node.operator !== "+") {
    return [];
  }
  if (node.left.type === "Literal" && typeof node.left.value === "string") {
    return [node];
  }

  if (node.right.type === "Literal" && typeof node.right.value === "string") {
    return [node];
  }

  const leftConcat = findInNode(node.left);
  if (leftConcat.length > 0) {
    return [node];
  }

  return [];
}

function findInExpressionStatement(node) {
  return findInNode(node.expression);
}

function findInCallExpression(node) {
  const values = node.arguments.map((argument) => {
    return findInNode(argument);
  });
  return [].concat.apply([], values);
}

function findInObjectExpression(node) {
  const values = node.properties.map((property) => {
    return findInNode(property);
  });
  return [].concat.apply([], values);
}

function findInProperty(node) {
  return findInNode(node.value);
}

function findInReturnStatement(node) {
  return findInNode(node.argument);
}

function findInFunctionDeclaration(node) {
  return findInNode(node.body);
}

function findInBlockStatement(node) {
  const values = node.body.map((bodyPart) => {
    return findInNode(bodyPart);
  });

  return [].concat.apply([], values);
}

function findInIfStatement(node) {
  return findInNode(node.test).concat(findInNode(node.consequent));
}

function findInNewExpression(node) {
  const values = node.arguments.map((argument) => {
    return findInNode(argument);
  });
  return [].concat.apply([], values);
}

function findInConditionalExpression(node) {
  return findInNode(node.test).concat(findInNode(node.consequent));
}

function findInThrowStatement(node) {
  return findInNode(node.argument);
}

module.exports = {
  replaceCode: replaceCode,
  findStringConcatenations: findStringConcatenations
};
