const estraverse = require('estraverse');
const escodegen = require('escodegen');
const shuffle = require('lodash.shuffle');
const uniqueRandom = require('unique-random');
const astHelper = require('../../utils/ast');

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
  const globalJmpTable = {};

  astHelper.flow_set_next = (step) => {
    return astHelper.assgin_variable('__step__', step); // 水平流程, 下一步就是下一个数组内容
  };

  estraverse.traverse(source.ast, {
    enter (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        scopeMgr.push(scopeMgr.cnt_scope++);
        console.log('enter scope: ' + scopeMgr.current().id);
      }
    },
    leave (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        const scope = scopeMgr.current();
        console.log('leave scope: ' + scope.id);
        scopeMgr.pop();

        const rand = uniqueRandom(1, 0x1FFFFFFF);
        const switchCaseFlow = [];

        // 匹配流程
        const initLabel = rand();
        let stepLabel = initLabel;
        estraverse.replace(node, {
          enter (node_, parent_) {
            if (node_.type === 'ExpressionStatement' ||
              node_.type === 'VariableDeclaration' || node_.type === 'FunctionDeclaration') {
              // push a new switch case node
              const step = {
                label: stepLabel,
                to: rand(),
                nextLabel: rand(),
              };
              globalJmpTable[step.label] = step.to;
              switchCaseFlow.push({
                'type': 'SwitchCase',
                'test': {
                  'type': 'Literal',
                  'value': step.to
                },
                'consequent': [
                  // 当前代码
                  node_,
                  // 准备下一步代码
                  astHelper.flow_set_next(step.nextLabel), // 水平流程, 下一步
                  astHelper.break(),
                ]
              });

              stepLabel = step.nextLabel;
              return astHelper.empty();
            }

            if (node_.type === 'IfStatement') {
              const caseValue = {
                if: rand(),
                consequent: rand(),
                alternate: rand()
              };
              let step = {
                if: stepLabel,
                consequent: rand(),
                alternate: rand(),
                end: rand(),
              };

              globalJmpTable[step.if] = caseValue.if;
              globalJmpTable[step.consequent] = caseValue.consequent;
              globalJmpTable[step.alternate] = caseValue.alternate;

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
                'consequent': (() => {
                  const ret = [
                    // 准备下一步代码
                    astHelper.flow_set_next(step.end),
                    astHelper.break(),
                  ];
                  if (node_.consequent) { // 当前代码
                    ret.unshift(node_.consequent);
                  }
                  return ret;
                })()
              });
              // alternate (false)
              switchCaseFlow.push({
                'type': 'SwitchCase',
                'test': {
                  'type': 'Literal',
                  'value': caseValue.alternate
                },
                'consequent': (() => {
                  const ret = [
                    // 准备下一步代码
                    astHelper.flow_set_next(step.end),
                    astHelper.break(),
                  ];
                  if (node_.alternate) { // 当前代码
                    ret.unshift(node_.alternate);
                  }
                  return ret;
                })()
              });

              stepLabel = step.end;
              return astHelper.empty();
            }

            if (node_.type === 'SwitchStatement') {
              // SwitchStatement n个展开, 混入父级

              const caseCount = node_.cases.length;
              const steps = [{ step: stepLabel, to: rand() }];
              const oldCases = []; // 原有switch case暂存
              for (let i = 0; i < caseCount; i++) {
                const step = rand();
                steps.push({ step, to: rand() });
                oldCases.push(node_.cases[i].consequent);
                node_.cases[i].consequent = [
                  astHelper.flow_set_next(step),
                  astHelper.break(),
                ];
              }
              steps.push({ step: rand(), to: rand() }); // 下一个语句的 step

              for (let i = 0; i < steps.length; i++) {
                globalJmpTable[steps[i].step] = steps[i].to
              }

              // body 0
              switchCaseFlow.push({
                'type': 'SwitchCase',
                'test': {
                  'type': 'Literal',
                  'value': steps[0].to
                },
                'consequent': [
                  // 当前代码 switch
                  {
                    'type': 'SwitchStatement',
                    'discriminant': node_.discriminant,
                    'cases': node_.cases
                  },
                  // 下一步
                  astHelper.flow_set_next(steps[steps.length - 1].step),
                  astHelper.break(),
                ]
              });

              // body caseCount 个
              for (let i = 0; i < caseCount; i++) {
                switchCaseFlow.push({
                  'type': 'SwitchCase',
                  'test': {
                    'type': 'Literal',
                    'value': steps[i + 1].to
                  },
                  'consequent': [
                    ...oldCases[i],
                    // 准备下一步代码
                    astHelper.flow_set_next(steps[steps.length - 1].step),
                    astHelper.break(),
                  ]
                });
              }

              stepLabel = steps[steps.length - 1].step;
              return astHelper.empty();
            }

            if (node_.type === 'TryStatement') {
              stepLabel = step.end;
              return astHelper.empty();
            }
          }
        });

        // set `__step__ = false;` to break the while loop
        const step = {
          label: stepLabel,
          to: rand(),
          nextLabel: rand(),
        };
        globalJmpTable[step.label] = step.to;
        switchCaseFlow.push({
          'type': 'SwitchCase',
          'test': {
            'type': 'Literal',
            'value': step.to
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
                  'value': initLabel
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
                'type': 'ObjectExpression',
                'properties': (function () {
                  const ret = [];
                  for (let key in globalJmpTable) {
                    if (globalJmpTable.hasOwnProperty(key)) {
                      ret.push({
                        'type': 'Property',
                        'key': {
                          'type': 'Literal',
                          'value': key,
                        },
                        'computed': false,
                        'value': {
                          'type': 'Literal',
                          'value': globalJmpTable[key],
                        },
                        'kind': 'init',
                        'method': false,
                        'shorthand': false
                      });
                    }
                  }
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
