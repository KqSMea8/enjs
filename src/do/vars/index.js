const estraverse = require('estraverse');
const escodegen = require('escodegen');

function handle (source) {
  const variablesContainer = '_0x' + parseInt(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
  const scopes = [{
    prefix: '0x0_'
  }];
  let cnt_scope = 1;
  estraverse.replace(source.ast, {
    enter (node, parent) {
      // if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
      // FunctionDeclaration 会被替换掉, 没有 FunctionDeclaration
      if (node.type === 'FunctionExpression') {
        const prefix = '_0x' + cnt_scope + '_';
        scopes.push({
          prefix
        });
        console.log('push stack' + prefix);
        cnt_scope++;
      }
      const prefix = scopes[scopes.length - 1].prefix;
      // console.log(node);


      if (node.type === 'VariableDeclaration') {
        // `var a = 1` --> `_global['a'] = 1`
        const _expressions = [];
        node.declarations.forEach(e=>{
          _expressions.push({
            type: 'AssignmentExpression',
            operator: '=',
            left:
              {
                type: 'MemberExpression',
                computed: true,
                object: { type: 'Identifier', name: variablesContainer },
                property: {
                  type: 'Literal',
                  value: prefix + e.id.name,
                  raw: `'${prefix + e.id.name}'`
                }
              },
            right: e.init
          })
        });
        return {
          type: "ExpressionStatement",
          expression: {
            type: "SequenceExpression",
            expressions: _expressions
          }
        };
      } else if (node.type === 'FunctionDeclaration') {
        // `function a(){}` --> `_global['a'] = function (){}`
        const _FunctionExpression = Object.assign({}, node);
        _FunctionExpression.type = 'FunctionExpression';
        _FunctionExpression.id = null;
        return {
          type: 'ExpressionStatement',
          expression:
            {
              type: 'AssignmentExpression',
              operator: '=',
              left:
                {
                  type: 'MemberExpression',
                  computed: true,
                  object: { type: 'Identifier', name: variablesContainer },
                  property: {
                    type: 'Literal',
                    value: prefix + node.id.name,
                    raw: `'${prefix + node.id.name}'`
                  }
                },
              right: _FunctionExpression
            }
        }
      } else if (node.type === 'Identifier' && node.name !== variablesContainer) {
        return {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: variablesContainer },
          property: {
            type: 'Literal',
            value: prefix + node.name,
            raw: `'${prefix + node.name}'`
          }
        }
      }
    },
    leave (node, parent) {
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        const { prefix } = scopes.pop();
        console.log('pop stack' + prefix);
      }
    }
  });
  source.ast.body.unshift({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: variablesContainer },
        init: { type: 'ArrayExpression', elements: [] }
      }
    ],
    kind: 'var'
  });
  source.code = escodegen.generate(source.ast);
  console.log("\r\n");
  console.log(source.code);
  console.log("\r\n");
}

module.exports = {
  handle
};
