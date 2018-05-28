
if(1){
  let __local_1 = __input_var + 1000;
  while (__local_1 > 1) {
    if (__local_1 % 2 === 1) {
      __local_1 = 3 * __local_1 + 1;
    } else {
      __local_1 = __local_1 / 2;
    }
    if((__input_var - __local_1 > (__input_val-2)) && __input_var + __local_1 < (__input_val+2)){
      __do_action();
    }
  }
}