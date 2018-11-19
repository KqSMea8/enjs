const estraverse = require('estraverse');
const escodegen = require('escodegen');

function handle (source) {
  const variablesContainer = '_0x' + parseInt(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
  const scopeMgr = {
    scopes: [{
      id: 0,
      variables: [],
      node: source.ast
    }],
    entered: [0],
    cnt_scope: 1,
    current () {
      return this.scopes[this.entered[this.entered.length - 1]]
    },
    get (level) {
      return this.scopes[level]
    },
    add (scope) {
      scope.id = this.cnt_scope;
      this.scopes.push(scope);
      return this.cnt_scope++;
    },
    push (scopeId) {
      return this.entered.push(scopeId)
    },
    pop () {
      return this.entered.pop()
    }
  };
  // 先匹配一下各个 scope 的变量, 一些预处理
  estraverse.replace(source.ast, {
    enter (node, parent) {
      const scope = scopeMgr.current();

      if (node.body && node.body.length > 1) {
        // 将函数声明提升到作用域顶部 (变量全都变成数组访问了, 默认值就是undefined, 无需提升)
        node.body.forEach(e => {
          if (e.type === 'FunctionDeclaration') {
            const scope_body = scope.node.body.constructor === Array ? scope.node.body : scope.node.body.body;
            let parent_body = null;
            if (parent.type === 'Program' || parent.type === 'BlockStatement') {
              parent_body = parent.body
            } else if (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration') {
              parent_body = parent.body.body
            } else if (parent.type === 'TryStatement') {
              parent_body = parent.block.body
            } else if (parent.type === 'IfStatement') {
              parent_body = parent.consequent.body
            } else {
              debugger;
              throw new Error('test');
            }
            for (let i = 0; i < scope_body.length; i++) {
              if (scope_body[i].type !== 'FunctionDeclaration') {
                parent_body.splice(parent_body.indexOf(e), 1);
                scope_body.splice(i, 0, e);
                break;
              }
            }
          }
        })
      }

      if (node.type === 'VariableDeclaration') {
        node.declarations.forEach(e => {
          scope.variables.push(e.id.name);
        });
      }
      else if (node.type === 'FunctionDeclaration') {
        scope.variables.push(node.id.name);
      }

      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        const scopeId = scopeMgr.add({
          node,
          variables: [],
          parent: scope
        });
        scopeMgr.push(scopeId);
      }
    },
    leave (node, parent) {
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        scopeMgr.pop();
      }
    }
  });
  scopeMgr.cnt_scope = 1;
  scopeMgr.entered = [0];
  estraverse.replace(source.ast, {
    enter (node, parent) {
      // if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
      // FunctionDeclaration 会被替换掉, 没有 FunctionDeclaration
      if (node.type === 'FunctionExpression') {
        scopeMgr.push(scopeMgr.cnt_scope++);
        console.log('enter scope: ' + scopeMgr.current().id);
        // 进入作用域, 重新初始化变量? 还未确定
      }

      const scope = scopeMgr.current();
      let prefix = `_0x${scope.id}_`;
      // console.log(node);

      // return ;

      if (node.type === 'VariableDeclaration') {
        const _expressions = [];
        node.declarations.forEach(e => {
          scope.variables.push(e.id.name);
          // `var a = 1` --> `_global['a'] = 1`
          // `var a` --> `_global['a'] = null`
          if(parent.type === 'ForInStatement'){
            _expressions.push({
              type: 'MemberExpression',
              computed: true,
              object: { type: 'Identifier', name: variablesContainer },
              property: {
                type: 'Literal',
                value: prefix + e.id.name,
                raw: `'${prefix + e.id.name}'`
              }
            })
          }else{
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
              right: e.init || { type: 'Literal', value: null, raw: 'null' }
            })
          }
        });

        switch (parent.type) {
          case 'ForInStatement' :
          case 'ForStatement' :
            return _expressions[0];
          default:
            return {
              type: "ExpressionStatement",
              expression: {
                type: "SequenceExpression",
                expressions: _expressions
              }
            };
        }
      }
      else if (node.type === 'FunctionDeclaration') {
        // `function a(){}` --> `_global['a'] = function (){}`
        const _FunctionExpression = Object.assign({}, node);
        _FunctionExpression.type = 'FunctionExpression';
        _FunctionExpression.id = null;
        scope.variables.push(node.id.name);
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
      }
      else if (node.type === 'Identifier' &&
        !(parent.type === 'Property' && node === parent.key) && // 不是对象属性名称 (声明)
        !(parent.type === 'MemberExpression' && node === parent.property && parent.computed === false) && // 不是对象属性名称 (访问)
        !(parent.type === 'FunctionExpression' && parent.params.includes(node)) && // 不是函数参数
        !(parent.type === 'CatchClause') && // 不是 try的catch
        node.name !== variablesContainer) {

        // 是函数的参数, 直接返回
        if (scope.node.type === 'FunctionExpression') {
          for (let i = 0; i < scope.node.params.length; i++) {
            if (scope.node.params[i].name === node.name) {
              return;
            }
          }
        }

        prefix = false;
        for (let tmpScope = scope; tmpScope; tmpScope = tmpScope.parent) {
          if (tmpScope.variables.includes(node.name)) {
            prefix = `_0x${tmpScope.id}_`;
            break;
          }
        }
        // 定义过的变量 (外部作用域 or 当前作用域)
        if (prefix === false) {
          return;
        }
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
        console.log('leave scope: ' + scopeMgr.current().id);
        scopeMgr.pop();
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
