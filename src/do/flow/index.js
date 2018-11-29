const estraverse = require('estraverse');
const escodegen = require('escodegen');
const shuffle = require('lodash.shuffle');
const uniqueRandom = require('unique-random');

const FLOW_DEBUG = true;

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
  const astHelper = {
    break () {
      return {
        'type': 'BreakStatement',
        'label': null
      };
    },
    empty () {
      return {
        'type': 'EmptyStatement'
      };
    },
    flow_set_next (step) {
      return {
        'type': 'ExpressionStatement',
        'expression': {
          'type': 'AssignmentExpression',
          'operator': '=',
          'left': {
            'type': 'Identifier',
            'name': '__step__'
          },
          'right': {
            'type': 'Literal',
            'value': step // 水平流程, 下一步就是下一个数组内容
          }
        }
      };
    }
  };

  estraverse.traverse(source.ast, {
    enter (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        scopeMgr.push(scopeMgr.cnt_scope++);
        console.log('enter scope: ' + scopeMgr.current().id);

        const rand = uniqueRandom(1, 0x1FFFFFFF);
        const switchCaseFlow = [];

        // 匹配流程
        estraverse.replace(node, {
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
                  astHelper.flow_set_next(globalJmpTable.length), // 水平流程, 下一步就是下一个数组内容
                  astHelper.break(),
                ]
              });

              return astHelper.empty();
            } else if (node_.type === 'IfStatement') {
              const caseValue = {
                if: rand(),
                consequent: rand(),
                alternate: rand()
              };
              let step = {
                if: globalJmpTable.length - 1,
                consequent: globalJmpTable.length + 1,
                alternate: globalJmpTable.length + 2,
                end: globalJmpTable.length + 3,
              };

              globalJmpTable.push(caseValue.if);
              globalJmpTable.push(caseValue.consequent);
              globalJmpTable.push(caseValue.alternate);

              // if
              switchCaseFlow.push({
                'type': 'SwitchCase',
                'test': {
                  'type': 'Literal',
                  'value': caseValue.if
                },
                'consequent': [
                  // 当前代码
                  {
                    'type': 'IfStatement',
                    'test': node_.test,
                    'consequent': {
                      'type': 'BlockStatement',
                      'body': [
                        astHelper.flow_set_next(step.consequent),
                      ]
                    },
                    'alternate': {
                      'type': 'BlockStatement',
                      'body': [
                        astHelper.flow_set_next(step.alternate),
                      ]
                    }
                  },
                  astHelper.break(),
                ]
              });
              // consequent (true)
              switchCaseFlow.push({
                'type': 'SwitchCase',
                'test': {
                  'type': 'Literal',
                  'value': caseValue.consequent
                },
                'consequent': [
                  // 当前代码
                  node_.consequent,
                  // 准备下一步代码
                  astHelper.flow_set_next(step.end),
                  astHelper.break(),
                ]
              });
              // alternate (false)
              switchCaseFlow.push({
                'type': 'SwitchCase',
                'test': {
                  'type': 'Literal',
                  'value': caseValue.alternate
                },
                'consequent': [
                  // 当前代码
                  node_.alternate,
                  // 准备下一步代码
                  astHelper.flow_set_next(step.end),
                  astHelper.break(),
                ]
              });

              return astHelper.empty();
            }
          }
        });

        // set `__step__ = false;` to break the while loop
        const to = rand();
        globalJmpTable.push(to);
        switchCaseFlow.push({
          'type': 'SwitchCase',
          'test': {
            'type': 'Literal',
            'value': to
          },
          'consequent': [
            {
              'type': 'ExpressionStatement',
              'expression': {
                'type': 'AssignmentExpression',
                'operator': '=',
                'left': {
                  'type': 'Identifier',
                  'name': '__step__'
                },
                'right': {
                  'type': 'Literal',
                  'value': false
                }
              }
            },
            astHelper.break(),
          ]
        });

        // replace scope body to `while(1) { switch (__flow__.next()) { case... } }`
        node.body = [
          {
            'type': 'VariableDeclaration',
            'declarations': [
              {
                'type': 'VariableDeclarator',
                'id': {
                  'type': 'Identifier',
                  'name': '__step__'
                },
                'init': {
                  'type': 'Literal',
                  'value': 0
                }
              }
            ],
            'kind': 'var'
          },
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
                    'arguments': [
                      {
                        'type': 'Identifier',
                        'name': '__step__'
                      }
                    ]
                  },
                  'cases': FLOW_DEBUG ? switchCaseFlow : shuffle(switchCaseFlow) // 流程打乱
                },
                {
                  'type': 'IfStatement',
                  'test': {
                    'type': 'BinaryExpression',
                    'operator': '===',
                    'left': {
                      'type': 'Identifier',
                      'name': '__step__'
                    },
                    'right': {
                      'type': 'Literal',
                      'value': false
                    }
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
                'name': 'next'
              },
              'computed': false,
              'value': {
                'type': 'FunctionExpression',
                'id': null,
                'params': [
                  {
                    'type': 'Identifier',
                    'name': '__step__'
                  }
                ],
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
                          'type': 'Identifier',
                          'name': '__step__'
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
