function f (count) {
  function f2 () {
    console.log('f2');
  }
  f2 ();
  for (var i = 0; i < count; i++) {
    console.log(i);
    f(count - 1);
  }
}
f(3);
