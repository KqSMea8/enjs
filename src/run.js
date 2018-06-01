const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const collatz = require('./collatz');
const encrypt = require('./encrypt');

const code = require('fs').readFileSync('./demo/demo.js').toString();
const ast = esprima.parse(code);
console.log('// Code with trigger condition:');
console.log(code);
console.log('// --------------------------------------');
console.log('// Obfuscated code:');
estraverse.replace(ast, {
  enter (node) {
    if (node.__obfuscated) return;

    if (node.type === 'IfStatement' && node.test.type === 'BinaryExpression') {
      // 一方是数字的 IfStatement
      if (node.test.left.type === 'Literal' || node.test.right.type === 'Literal') {
        switch (node.test.operator) {
          case '===':
            return collatz.getByLiteral_e(node);
          case '>':
            return collatz.getByLiteral_g(node);
          case '>=':
            return collatz.getByLiteral_ge(node);
          case '<':
            return collatz.getByLiteral_l(node);
          case '<=':
            return collatz.getByLiteral_le(node);
          case '!==':
            return collatz.getByLiteral_ne(node);
        }
      }
    }
  }
});
const regen_code = escodegen.generate(ast);
console.log(regen_code);
eval(regen_code);


const en_code = encrypt.en(regen_code);
console.log(en_code);
eval(en_code);



