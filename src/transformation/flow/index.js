const estraverse = require('estraverse');
const escodegen = require('escodegen');
const shuffle = require('lodash.shuffle');
const uniqueRandom = require('unique-random');
const astHelper = require('../../utils/ast-helper');

const _FLOW_DEBUG = true;

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
  if (_FLOW_DEBUG) console.log('\r\nparse scope....');
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

  if (_FLOW_DEBUG) console.log('\r\nobfuscate working flow....');
  scopeMgr.cnt_scope = 1;
  scopeMgr.entered = [0];
  const globalJmpTable = {};
  const globalJmpTableName = astHelper.randomName();

  astHelper.flow_set_next = (stepIdentityName, step) => {
    return astHelper.ASSIGN_VARIABLE(stepIdentityName, step); // 水平流程, 下一步就是下一个数组内容
  };

  estraverse.traverse(source.ast, {
    enter (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration')) {
        scopeMgr.push(scopeMgr.cnt_scope++);
        if (_FLOW_DEBUG) console.log('enter scope: ' + scopeMgr.current().id);
      }
    },
    leave (node, parent) {
      if (node.type === 'BlockStatement' && (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration') && node.body.length > 2) {
        const scope = scopeMgr.current();
        if (_FLOW_DEBUG) console.log('leave scope: ' + scope.id);
        scopeMgr.pop();

        const rand = uniqueRandom(1, 0x1FFFFFFF);
        const stepIdentityName = astHelper.randomName();

        // 匹配流程
        const initLabel = rand();
        let stepLabel = initLabel;
        const switchCaseFlow = [];
        let readyForFlatFlow = false;

        const pushNewJmpCase = (body, { label, caseValue, nextLabel } = {}) => {
          const step = {
            label: label || stepLabel,
            caseValue: caseValue || rand(),
            nextLabel: nextLabel || rand(),
          };
          globalJmpTable[step.label] = step.caseValue;
          switchCaseFlow.push({
            'type': 'SwitchCase',
            'test': {
              'type': 'Literal',
              'value': step.caseValue
            },
            'consequent': [
              ...body(step.nextLabel),
              astHelper.BREAK_STATEMENT(),
            ]
          });
          stepLabel = step.nextLabel;
          readyForFlatFlow = false;
        };

        pushNewJmpCase(nextLabel => {
          return [
            astHelper.flow_set_next(stepIdentityName, nextLabel),
          ];
        });

        for (let i = 0; i < node.body.length; i++) {
          const node_ = node.body[i];
          switch (node_.type) {
            case 'IfStatement': {
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

              // if
              pushNewJmpCase(() => {
                return [
                  {
                    'type': 'IfStatement',
                    'test': node_.test,
                    'consequent': {
                      'type': 'BlockStatement',
                      'body': [
                        astHelper.flow_set_next(stepIdentityName, node_.consequent ? step.consequent : step.end),
                      ]
                    },
                    'alternate': {
                      'type': 'BlockStatement',
                      'body': [
                        astHelper.flow_set_next(stepIdentityName, node_.alternate ? step.alternate : step.end),
                      ]
                    }
                  }
                ];
              }, {
                label: step.if,
                caseValue: caseValue.if
              });

              // consequent (true)
              if (node_.consequent) {
                pushNewJmpCase(() => {
                  return [
                    node_.consequent,
                    // 准备下一步代码
                    astHelper.flow_set_next(stepIdentityName, step.end),
                  ];
                }, {
                  label: step.consequent,
                  caseValue: caseValue.consequent
                });
              }

              // alternate (false)
              if (node_.alternate) {
                pushNewJmpCase(() => {
                  return [
                    node_.alternate,
                    // 准备下一步代码
                    astHelper.flow_set_next(stepIdentityName, step.end),
                  ];
                }, {
                  label: step.alternate,
                  caseValue: caseValue.alternate
                });
              }

              stepLabel = step.end;
              break;
            }
            case 'SwitchStatement_@deprecated': {
              // SwitchStatement n个展开, 混入父级
              // 需要处理 BREAK_STATEMENT 问题 较为麻烦

              const caseCount = node_.cases.length;
              const steps = [{ step: stepLabel, to: rand() }];
              const oldCases = []; // 原有switch case暂存
              for (let i = 0; i < caseCount; i++) {
                const step = rand();
                steps.push({ step, to: rand() });
                oldCases.push(node_.cases[i].consequent);
                node_.cases[i].consequent = [
                  astHelper.flow_set_next(stepIdentityName, step),
                  astHelper.BREAK_STATEMENT(),
                ];
              }
              steps.push({ step: rand(), to: rand() }); // 下一个语句的 step

              for (let i = 0; i < steps.length; i++) {
                globalJmpTable[steps[i].step] = steps[i].to;
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
                  astHelper.flow_set_next(stepIdentityName, steps[steps.length - 1].step),
                  astHelper.BREAK_STATEMENT(),
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
                    astHelper.flow_set_next(stepIdentityName, steps[steps.length - 1].step),
                    astHelper.BREAK_STATEMENT(),
                  ]
                });
              }

              stepLabel = steps[steps.length - 1].step;
              break;
            }
            case 'ExpressionStatement': {
              // push a new switch case node
              pushNewJmpCase(nextLabel => {
                return [
                  node_, // 当前代码
                  astHelper.flow_set_next(stepIdentityName, nextLabel), // 水平流程, 下一步
                ];
              });
              break;
            }
            case 'VariableDeclaration':
            case 'FunctionDeclaration':
            default: {
              if (readyForFlatFlow === false) {
                pushNewJmpCase(nextLabel => {
                  return [
                    node_, // 当前代码
                    astHelper.flow_set_next(stepIdentityName, nextLabel), // 水平流程, 下一步
                  ];
                });
                readyForFlatFlow = true;
              } else {
                // 加入上一句末尾
                switchCaseFlow[switchCaseFlow.length - 1].consequent.splice(switchCaseFlow.length - 1, 0, node_);
              }
            }
          }
        }

        // set `__step__ = false;` to BREAK_STATEMENT the while loop
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
                  'name': stepIdentityName
                },
                'right': {
                  'type': 'Literal',
                  'value': false
                }
              }
            },
            astHelper.BREAK_STATEMENT(),
          ]
        });

        // replace scope body to `while(1) { switch ({globalJmpTableName}.next()) { case... } }`
        node.body = [
          {
            'type': 'VariableDeclaration',
            'declarations': [
              {
                'type': 'VariableDeclarator',
                'id': {
                  'type': 'Identifier',
                  'name': stepIdentityName
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
                        'name': globalJmpTableName
                      },
                      'property': {
                        'type': 'Identifier',
                        'name': 'next'
                      }
                    },
                    'arguments': [
                      {
                        'type': 'Identifier',
                        'name': stepIdentityName
                      }
                    ]
                  },
                  'cases': _FLOW_DEBUG ? switchCaseFlow : shuffle(switchCaseFlow) // 流程打乱
                },
                {
                  'type': 'IfStatement',
                  'test': {
                    'type': 'BinaryExpression',
                    'operator': '===',
                    'left': {
                      'type': 'Identifier',
                      'name': stepIdentityName
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
          'name': globalJmpTableName
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
                    'name': 'a'
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
                          'name': 'a'
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
  if (_FLOW_DEBUG) {
    console.log('\r\n');
    console.log(source.code);
    console.log('\r\n');
  }
}

module.exports = {
  handle
};
