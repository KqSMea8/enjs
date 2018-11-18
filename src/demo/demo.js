function do_m (i, expression) {
  console.log(i.toString().padEnd(4), expression.padEnd(48) + ' passed!')
}

var __global_v = 0;

function test_func () {
  __global_v++;
  console.log('__global_v: ' + __global_v);
  return __global_v;
}

var x = parseInt('29') + 1;
var y = 30;
if (x === 30) {
  do_m(1,'x === 30');
}
if (x + 1 - 1 === 30) {
  do_m(2,'x + 1 - 1 === 30');
}
if (30 === x) {
  do_m(3,'30 === x');
}
if (30 === x + 1 - 1) {
  do_m(4,'30 === x + 1 - 1');
}
if (x === y) {
  do_m(5,'x === y');
}
if (y === x) {
  do_m(6,'y === x');
}
if (x + 1 - 1 === y) {
  do_m(7,'x + 1 - 1 === y');
}
if (y === x + 1 - 1) {
  do_m(8,'y === x + 1 - 1');
}

if (test_func() === 1) {
  do_m(9,'test_func() === 1');
}
if (2 === test_func()) {
  do_m(10,'2 === test_func()');
}
