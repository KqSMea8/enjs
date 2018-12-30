/**
 * Collatz
 * 3x+1
 */
const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const estraverse = require('estraverse');
const astHelper = require('../../utils/ast-helper');

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gen Expression
 * @param _IfStatement 表达式
 * @param type 运算符号类型
 */
function getByLiteral (_IfStatement, type) {
  const collatzFiles = fs.readdirSync(path.join(__dirname, 'db', type))
    .filter(e => e.indexOf('.js') > -1);
  if (collatzFiles.length < 1) {
    return _IfStatement;
  }
  const astFile = collatzFiles[randomInt(0, collatzFiles.length - 1)];

  const astSourceCode = fs.readFileSync(path.join(__dirname, 'db', type, astFile))
    .toString()
    .replace(/local/g, astHelper.randomName());
  const collatzAst = esprima.parse(astSourceCode);

  estraverse.replace(collatzAst, {
    enter (node) {
      /**
       * collatz 将 if (a === 1) 这类判断转换成复杂的循环, 需要输入两个值, a 与 1
       */
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
          node.body[0].expression.callee.name === '__do') {
          return _IfStatement.consequent;
        }
      }
    }
  });
  return collatzAst;
}

module.exports = {
  getByLiteral,
  getByLiteral_e: _ => getByLiteral(_, 'e'),
  getByLiteral_g: _ => getByLiteral(_, 'g'),
  getByLiteral_ge: _ => getByLiteral(_, 'ge'),
  getByLiteral_l: _ => getByLiteral(_, 'l'),
  getByLiteral_le: _ => getByLiteral(_, 'le'),
  getByLiteral_ne: _ => getByLiteral(_, 'ne'),
};
