"use strict";
const acorn = require("acorn");

function rewriteNode(content, node) {
  if (node.type === "Literal") { // TODO: WHAT IF NOT STRING?
    return content.slice(node.start + 1, node.end - 1);
  } else if (node.type === "BinaryExpression") {
    return `${rewriteNode(content, node.left)}${rewriteNode(content, node.right)}`;
  } else {
    return `\${${content.slice(node.start, node.end)}}`;
  }
}

function replaceCode(originalConcat) {
  const topNode = acorn.parse(originalConcat).body[0].expression;
  return `\`${rewriteNode(originalConcat, topNode.left)}${rewriteNode(originalConcat, topNode.right)}\``;
}

function findStringConcatenations(content) {
  if (content[0] === "#") {
    const lines = content.split("\n");
    lines.splice(0, 1);
    content = lines.join("\n");
  }
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
      case "AssignmentExpression":
          return findInAssignmentExpression(node);
      case "FunctionExpression":
          return findInFunctionExpression(node);
      case "ArrayExpression":
          return findInArrayExpression(node);
      case "SwitchStatement":
          return findInSwitchStatement(node);
      case "SwitchCase":
          return findInSwitchCase(node);
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
  return findInNode(node.test)
    .concat(findInNode(node.consequent))
    .concat(findInNode(node.alternate));
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

function findInAssignmentExpression(node) {
  return findInNode(node.left).concat(findInNode(node.right));
}

function findInFunctionExpression(node) {
  return findInNode(node.body);
}

function findInArrayExpression(node) {
  const values = node.elements.map((element) => {
    return findInNode(element);
  });

  return [].concat.apply([], values);
}

function findInSwitchStatement(node) {
  const values = node.cases.map((switchCase) => {
    return findInNode(switchCase);
  });

  return [].concat.apply([], values);
}

function findInSwitchCase(node) {
  const values = node.consequent.map((consequent) => {
    return findInNode(consequent);
  });

  return [].concat.apply([], values);
}

module.exports = {
  replaceCode: replaceCode,
  findStringConcatenations: findStringConcatenations
};
