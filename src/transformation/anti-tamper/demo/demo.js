'use strict';

/**
 * @return {undefined}
 */
function hi () {
  // 创建函数, 只创建一次
  var createFunctionOnce = (function () {
    var needCreate = true;
    return function (obj, func) {
      var retFunction = needCreate ? function () {
        if (func) {
          var resultFunc = func.apply(obj, arguments);
          func = null;
          return resultFunc;
        }
      } : function () { };
      needCreate = false;
      return retFunction;
    };
  })();
  var detectTamper = createFunctionOnce(this, function () {
    var func1 = function () {
      return 'dev';
    };
    var func2 = function () {
      return 'window';
    };

    var test1 = function () {
      /** @type {!RegExp} */
      var test = new RegExp("\\w+ *\\(\\) *{\\w+ *['|\"].+['|\"];? *}");
      return !test.test(func1.toString());
    };

    var test2 = function () {
      /** @type {!RegExp} */
      var test = new RegExp('(\\\\[x|u](\\w){2,4})+');
      return test.test(func2.toString());
    };

    var decoy = function (str) {
      if (str.indexOf('e') !== 3) {
        decoy(str);
      }
    };

    if (!test1()) {
      if (!test2()) {
        decoy('ind\u0435xOf');
      } else {
        decoy('indexOf');
      }
    } else {
      decoy('ind\u0435xOf');
    }
  });
  detectTamper();

  /** @type {string} */
  var body = 'Hello World!';
  console['log'](body);
}

hi();
