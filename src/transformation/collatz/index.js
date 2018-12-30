const estraverse = require('estraverse');
const escodegen = require('escodegen');
const db = require('./db');

function handle (source) {
  estraverse.replace(source.ast, {
    leave (node) {
      if (node.__obfuscated) return;

      if (node.type === 'IfStatement' && node.test.type === 'BinaryExpression') {
        // 一方是数字的 IfStatement
        if (node.test.left.type === 'Literal' || node.test.right.type === 'Literal') {
          let collatzAst = null;
          switch (node.test.operator) {
            case '===':
              collatzAst = db.getByLiteral_e(node);
              break;
            case '>':
              collatzAst = db.getByLiteral_g(node);
              break;
            case '>=':
              collatzAst = db.getByLiteral_ge(node);
              break;
            case '<':
              collatzAst = db.getByLiteral_l(node);
              break;
            case '<=':
              collatzAst = db.getByLiteral_le(node);
              break;
            case '!==':
              collatzAst = db.getByLiteral_ne(node);
              break;
          }
          if (collatzAst) {
            collatzAst.__obfuscated = true;
            return collatzAst;
          }
        }
      }
    }
  });
  source.code = escodegen.generate(source.ast);
}

module.exports = {
  handle
};
