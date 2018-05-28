/**
 * Collatz
 * 3x+1
 */
const fs = require('fs');
const path = require('path');
const estraverse = require('estraverse');

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gen Expression
 * @param _IfStatement
 */
function getByLiteral1 (_IfStatement) {
  const random = getRandomInt(1, 2);
  let collatz_ast = fs.readFileSync(path.join(__dirname, 'db', random + '.js.gen.json')).toString();

  collatz_ast = JSON.parse(collatz_ast);
  estraverse.replace(collatz_ast, {
    enter (node) {
      // console.log(node);
      node.__obfuscated = true;
      if (node.type === 'Identifier' && node.name === '__input_var') {
        // if 的 变量
        if (_IfStatement.test.left.type !== 'Literal') {
          return _IfStatement.test.left;
        } else {
          return _IfStatement.test.right;
        }
      } else if (node.type === 'Identifier' && node.name === '__input_val') {
        // if 的 数值
        if (_IfStatement.test.left.type === 'Literal') {
          return _IfStatement.test.left;
        } else {
          return _IfStatement.test.right;
        }
      } else if (node.type === 'BlockStatement') {
        // 执行 块
        if (node.body && node.body[0] && node.body[0].expression &&
          node.body[0].expression.type === 'CallExpression' &&
          node.body[0].expression.callee.name === '__do_action') {
          return _IfStatement.consequent
        }
      }
    }
  });
  return collatz_ast;
}

module.exports = {
  getByLiteral1
};