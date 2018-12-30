function detectTamper() {
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
};
