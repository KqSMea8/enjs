const esprima = require('esprima');
const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(path.join('..', 'db'));

files.forEach(filename => {
  if (filename.substr(-9, 9) !== '.gen.json') {
    const code = fs.readFileSync(path.join('..', 'db', filename)).toString();
    const code_gen = JSON.stringify(esprima.parse(code));
    fs.writeFileSync(path.join('..', 'db', filename + '.gen.json'), code_gen);
    console.log(filename, 'ok');
  }
});