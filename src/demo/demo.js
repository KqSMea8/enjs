function do_m (a) {
  console.log(a + ' passed!')
}
const x = parseInt('29') + 1;
const y = 30;
if (x === 30) {
  do_m(1);
}
if (x + 1 - 1 === 30) {
  do_m(2);
}
if (30 === x) {
  do_m(3);
}
if (30 === x + 1 - 1) {
  do_m(4);
}
if (x === y) {
  do_m(5);
}
if (y === x) {
  do_m(6);
}
if (x + 1 - 1 === y) {
  do_m(7);
}
if (y === x + 1 - 1) {
  do_m(8);
}