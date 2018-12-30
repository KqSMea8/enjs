if (1) {
  var local1 = __input_var;
  // let __input_val = __input_val; // 常量直接传入
  var local2 = local1 + 1000;
  while (local2 > 1) {
    if (local2 % 2 === 1) {
      local2 = 3 * local2 + 1;
    } else {
      local2 = local2 / 2;
    }
    if ((local1 - local2 > (__input_val - 2)) && local1 + local2 < (__input_val + 2)) {
      __do();
    }
  }
}
