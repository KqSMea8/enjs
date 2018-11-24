function f (count) {
  for (var i = 0; i < count; i++) {
    console.log(i);
    f(count - 1);
  }
}
f(3);
