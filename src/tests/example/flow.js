function f () {
  function f0 () {
    console.log('f0_' + a + '_' + b);
  }
  f0();

  var a = 1;
  var b = 2;

  function f1 () {
    var a2 = 1;
    var b2 = 2;
    console.log('f1_' + a2 + '_' + b2);
  }

  if (a === 1) {
    console.log('b: ' + b);
  }
  console.log('123');
  console.log('456');
  f1();
}

f();
