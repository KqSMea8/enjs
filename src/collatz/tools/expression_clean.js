const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(path.join('..', 'db'));

files.forEach(filename => {
  if (filename.substr(-9, 9) === '.gen.json') {
    fs.unlinkSync(path.join('..', 'db', filename))
  }
});
console.log('\nExpression cleaned\n');