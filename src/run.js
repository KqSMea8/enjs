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
    if (!node.__obfuscated && node.type === 'IfStatement' && node.test.type === 'BinaryExpression') {
      // 一方是数字的 IfStatement
      if(node.test.left.type === 'Literal' || node.test.right.type === 'Literal'){
        if (node.test.operator === '===') {
          return collatz.getByLiteral1(node)
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



