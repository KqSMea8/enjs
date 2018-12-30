const estraverse = require('estraverse');
const astHelper = {
  randomName () {
    if (!this._randomNameGenerator) {
      this._randomNameGenerator = require('unique-random')(1, 0x1FFFFFFF);
    }
    return '_' + this._randomNameGenerator().toString(16).padStart(8, '0');
  },
  BREAK_STATEMENT: () => {
    return {
      'type': 'BreakStatement',
      'label': null
    };
  },
  EMPTY_STATEMENT () {
    return {
      'type': 'EmptyStatement'
    };
  },
  ASSIGN_VARIABLE (variable, value) {
    return {
      'type': 'ExpressionStatement',
      'expression': {
        'type': 'AssignmentExpression',
        'operator': '=',
        'left': {
          'type': 'Identifier',
          'name': variable
        },
        'right': {
          'type': 'Literal',
          'value': value
        }
      }
    };
  },
  DECLARE_FUNCTION (name, params = [], body = []) {
    return {
      'type': 'FunctionDeclaration',
      'id': {
        'type': 'Identifier',
        'name': name
      },
      'params': params,
      'body': {
        'type': 'BlockStatement',
        'body': body
      },
      'generator': false,
      'expression': false,
      'async': false
    };
  },
  CALL_EXPRESSION (name, args = []) {
    return {
      'type': 'CallExpression',
      'callee': {
        'type': 'Identifier',
        'name': name
      },
      'arguments': args
    };
  },
  /**
   * 获取入口点的scope
   */
  getEntryScope (ast) {
    let firstEntryBody = ast.body;
    estraverse.traverse(ast, {
      enter: function (node, parent) {
        if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
          firstEntryBody = node.body;
          return estraverse.VisitorOption.Skip;
        } else if (node.type === 'CallExpression') {
          const functionName = node.name;

          estraverse.traverse(ast, {
            enter: function (node, parent) {
              if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
                if (node.id.name === functionName) {
                  firstEntryBody = node.body;
                  return estraverse.VisitorOption.Break;
                }
                return estraverse.VisitorOption.Skip;
              }
            },
          });

          return estraverse.VisitorOption.Break;
        }
      },
    });
    while (firstEntryBody.type === 'BlockStatement' && firstEntryBody.body.length) {
      firstEntryBody = firstEntryBody.body;
    }
    return firstEntryBody; // Array
  }
};

module.exports = astHelper;
