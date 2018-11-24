f();
f2();
function f () {
}

var f2 = function () {
  var f3 = function () {

  };
  f3()
};
f();
f2();
