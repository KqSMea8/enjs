function superXor (source) {
  const keySize = 128;
  const key = Array.apply(null, { length: keySize })
    .map(() => Math.round(Math.random() * 255));

  const table = [];
  for (let i = 0; i < source.code.length; i++) {
    const keyIndex = Math.round(Math.random() * keySize);
    const data = source.code.charCodeAt(i) ^ key[keyIndex];
    table.push(...[data, key[keyIndex]])
  }

  source.code = `
const table=[${table.toString()}];
const getKetIndex = input => table[input]; // 换成神经网络
const ret = [];
for (let i = 0; i < table.length; i+=2) {
  ret.push(table[i]^getKetIndex(i+1))
}
eval(ret.map(e=>String.fromCharCode(e)).join(''));
`;

  console.log('// Encrypted code:');
  console.log(source.code);
  // eval(source.code);
}

module.exports = {
  handle: superXor
};
