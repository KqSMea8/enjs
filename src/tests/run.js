const fs = require('fs');
const obfuscator = require('../obfuscator');
const path = require('path');

const scriptPath = path.join(__dirname, './example/flow.js');
const sourceCode = fs.readFileSync(scriptPath).toString();
const resultCode = obfuscator.exec(sourceCode, {
  antiTamper: 0,
  collatz: 0,
  vars: 0,
  flow: 1, // TODO 流程混淆问题查找
  unicode: 0
});

fs.writeFileSync(scriptPath + '.enc.js', resultCode);
