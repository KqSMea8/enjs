const estraverse = require('estraverse');
const escodegen = require('escodegen');
const shuffle = require('lodash.shuffle');
const uniqueRandom = require('unique-random');

function handle (source) {
  const scopeMgr = {
    scopes: [{
      id: 0,
      variables: [],
      node: source.ast
    }],
    entered: [0],
    cnt_scope: 1,
    current () {
      return this.scopes[this.entered[this.entered.length - 1]];
    },
    get (level) {
      return this.scopes[level];
    },
    add (scope) {
      scope.id = this.cnt_scope;
      this.scopes.push(scope);
      return this.cnt_scope++;
    },
    push (scopeId) {
      this.entered.push(scopeId);
    },
    pop () {
      this.entered.pop();
    }
  };

  // 先匹配一下各个 scope
  console.log('\r\nparse scope....');
  estraverse.replace(source.ast, {
    enter (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        const scopeId = scopeMgr.add({
          node,
          variables: [],
          parent: scopeMgr.current()
        });
        scopeMgr.push(scopeId);
        // console.log('enter scope: ' + scopeMgr.current().id);
      }
    },
    leave (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        const scope = scopeMgr.current();
        // console.log('leave scope: ' + scope.id);
        scopeMgr.pop();
      }
    }
  });

  console.log('\r\nobfuscate working flow....');
  scopeMgr.cnt_scope = 1;
  scopeMgr.entered = [0];
  const globalJmpTable = [];
  estraverse.traverse(source.ast, {
    enter (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        scopeMgr.push(scopeMgr.cnt_scope++);
        console.log('enter scope: ' + scopeMgr.current().id);

        const rand = uniqueRandom(1, 0x1FFFFFFF);
        const switchCaseFlow = [];
        estraverse.traverse(node, {
          enter (node_, parent_) {
            if (node_.type === 'ExpressionStatement' ||
              node_.type === 'VariableDeclaration' || node_.type === 'FunctionDeclaration') {
              // push a new switch case node
              const to = rand();
              globalJmpTable.push(to);
              switchCaseFlow.push({
                'type': 'SwitchCase',
                'test': {
                  'type': 'Literal',
                  'value': to
                },
                'consequent': [
                  // 当前代码
                  node_,
                  // 准备下一步代码
                  {
                    'type': 'ExpressionStatement',
                    'expression': {
                      'type': 'AssignmentExpression',
                      'operator': '=',
                      'left': {
                        'type': 'MemberExpression',
                        'computed': false,
                        'object': {
                          'type': 'Identifier',
                          'name': '__flow__'
                        },
                        'property': {
                          'type': 'Identifier',
                          'name': 'step'
                        }
                      },
                      'right': {
                        'type': 'Literal',
                        'value': globalJmpTable.length // 水平流程, 下一步就是下一个数组内容
                      }
                    }
                  },
                  {
                    'type': 'BreakStatement',
                    'label': null
                  }
                ]
              });
            }
          }
        });
        // set `end = true;` to break the while loop
        const to = rand();
        globalJmpTable.push(to);
        switchCaseFlow.push({
          'type': 'SwitchCase',
          'test': {
            'type': 'Literal',
            'value': to,
            'raw': `${to}`
          },
          'consequent': [
            {
              'type': 'ExpressionStatement',
              'expression': {
                'type': 'AssignmentExpression',
                'operator': '=',
                'left': {
                  'type': 'Identifier',
                  'name': 'end'
                },
                'right': {
                  'type': 'Literal',
                  'value': true,
                  'raw': 'true'
                }
              }
            },
            {
              'type': 'BreakStatement',
              'label': null
            }
          ]
        });
        // replace scope body
        node.body = [
          {
            'type': 'WhileStatement',
            'test': {
              'type': 'Literal',
              'value': 1,
              'raw': '1'
            },
            'body': {
              'type': 'BlockStatement',
              'body': [
                {
                  'type': 'VariableDeclaration',
                  'declarations': [
                    {
                      'type': 'VariableDeclarator',
                      'id': {
                        'type': 'Identifier',
                        'name': 'end'
                      },
                      'init': {
                        'type': 'Literal',
                        'value': false,
                        'raw': 'false'
                      }
                    }
                  ],
                  'kind': 'var'
                },
                {
                  'type': 'SwitchStatement',
                  'discriminant': {
                    'type': 'CallExpression',
                    'callee': {
                      'type': 'MemberExpression',
                      'computed': false,
                      'object': {
                        'type': 'Identifier',
                        'name': '__flow__'
                      },
                      'property': {
                        'type': 'Identifier',
                        'name': 'next'
                      }
                    },
                    'arguments': []
                  },
                  'cases': shuffle(switchCaseFlow) // 流程打乱
                },
                {
                  'type': 'IfStatement',
                  'test': {
                    'type': 'Identifier',
                    'name': 'end'
                  },
                  'consequent': {
                    'type': 'BreakStatement',
                    'label': null
                  },
                  'alternate': null
                }
              ]
            }
          }
        ];
      }
    },
    leave (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        const scope = scopeMgr.current();
        console.log('leave scope: ' + scope.id);
        scopeMgr.pop();
      }
    }
  });

  source.ast.body.unshift({
    'type': 'VariableDeclaration',
    'declarations': [
      {
        'type': 'VariableDeclarator',
        'id': {
          'type': 'Identifier',
          'name': '__flow__'
        },
        'init': {
          'type': 'ObjectExpression',
          'properties': [
            {
              'type': 'Property',
              'key': {
                'type': 'Identifier',
                'name': 'flow'
              },
              'computed': false,
              'value': {
                'type': 'ArrayExpression',
                'elements': (function () {
                  const ret = [];
                  globalJmpTable.forEach(to => {
                    ret.push({
                      'type': 'Literal',
                      'value': to,
                      'raw': `${to}`
                    });
                  });
                  return ret;
                })()
              },
              'kind': 'init',
              'method': false,
              'shorthand': false
            },
            {
              'type': 'Property',
              'key': {
                'type': 'Identifier',
                'name': 'step'
              },
              'computed': false,
              'value': {
                'type': 'Literal',
                'value': 0,
                'raw': '0'
              },
              'kind': 'init',
              'method': false,
              'shorthand': false
            },
            {
              'type': 'Property',
              'key': {
                'type': 'Identifier',
                'name': 'next'
              },
              'computed': false,
              'value': {
                'type': 'FunctionExpression',
                'id': null,
                'params': [],
                'body': {
                  'type': 'BlockStatement',
                  'body': [
                    {
                      'type': 'ReturnStatement',
                      'argument': {
                        'type': 'MemberExpression',
                        'computed': true,
                        'object': {
                          'type': 'MemberExpression',
                          'computed': false,
                          'object': {
                            'type': 'ThisExpression'
                          },
                          'property': {
                            'type': 'Identifier',
                            'name': 'flow'
                          }
                        },
                        'property': {
                          'type': 'MemberExpression',
                          'computed': false,
                          'object': {
                            'type': 'ThisExpression'
                          },
                          'property': {
                            'type': 'Identifier',
                            'name': 'step'
                          }
                        }
                      }
                    }
                  ]
                },
                'generator': false,
                'expression': false,
                'async': false
              },
              'kind': 'init',
              'method': false,
              'shorthand': false
            }
          ]
        }
      }
    ],
    'kind': 'var'
  });

  source.code = escodegen.generate(source.ast);
  console.log('\r\n');
  console.log(source.code);
  console.log('\r\n');
}

module.exports = {
  handle
};
