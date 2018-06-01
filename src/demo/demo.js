function do_m (a) {
  console.log(a + ' passed!')
}

let __global_v = 0;

function test_func () {
  __global_v++;
  console.log('__global_v: ' + __global_v);
  return __global_v;
}

const x = parseInt('29') + 1;
const y = 30;
if (x === 30) {
  do_m('x === 30');
}
if (x + 1 - 1 === 30) {
  do_m('x + 1 - 1 === 30');
}
if (30 === x) {
  do_m('30 === x');
}
if (30 === x + 1 - 1) {
  do_m('30 === x + 1 - 1');
}
if (x === y) {
  do_m('x === y');
}
if (y === x) {
  do_m('y === x');
}
if (x + 1 - 1 === y) {
  do_m('x + 1 - 1 === y');
}
if (y === x + 1 - 1) {
  do_m('y === x + 1 - 1');
}

if (test_func() === 1) {
  do_m('test_func() === 1');
}
if (2 === test_func()) {
  do_m('2 === test_func()');
}
