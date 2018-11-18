const estraverse = require('estraverse');
const escodegen = require('escodegen');
const gen = require('./gen');

function handle (source) {
  console.log('// Code with trigger condition:');
  console.log(source.code);
  console.log('// --------------------------------------');
  console.log('// Obfuscated code:');
  estraverse.replace(source.ast, {
    enter (node) {
      if (node.__obfuscated) return;

      if (node.type === 'IfStatement' && node.test.type === 'BinaryExpression') {
        // 一方是数字的 IfStatement
        if (node.test.left.type === 'Literal' || node.test.right.type === 'Literal') {
          switch (node.test.operator) {
            case '===':
              return gen.getByLiteral_e(node);
            case '>':
              return gen.getByLiteral_g(node);
            case '>=':
              return gen.getByLiteral_ge(node);
            case '<':
              return gen.getByLiteral_l(node);
            case '<=':
              return gen.getByLiteral_le(node);
            case '!==':
              return gen.getByLiteral_ne(node);
          }
        }
      }
    }
  });
  source.code = escodegen.generate(source.ast);
  console.log(source.code);
  // eval(source.code);
}

module.exports = {
  handle
};
