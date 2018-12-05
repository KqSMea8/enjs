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
  assgin_variable (variable, value) {
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
  }
};

module.exports = astHelper;
