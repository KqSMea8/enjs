function superXor (str) {
  const keySize = 128;
  const key = Array.apply(null, { length: keySize })
    .map(() => Math.round(Math.random() * 255));

  const table = [];
  for (let i = 0; i < str.length; i++) {
    const keyIndex = Math.round(Math.random() * keySize);
    const data = str.charCodeAt(i) ^ key[keyIndex];
    table.push(...[data, keyIndex])
  }

  return `
const keySize = 128;
const key=[${key.toString()}];
const table=[${table.toString()}];
const getKetIndex = input => table[input]; // 换成神经网络
const ret = [];
for (let i = 0; i < table.length - 1; i+=2) {
  ret.push(table[i]^key[getKetIndex(i+1)])
}
eval(ret.map(e=>String.fromCharCode(e)).join(''));
`;
}

module.exports = {
  en: superXor
};