const fs = require('fs');
const path = require('path');
const db_paths = fs.readdirSync(path.join('..', 'db'));

db_paths.forEach(db_path => {
  const files = fs.readdirSync(path.join('..', 'db', db_path));
  files.forEach(filename => {
    if (filename.substr(-9, 9) === '.gen.json') {
      fs.unlinkSync(path.join('..', 'db', db_path, filename))
    }
  });
});

console.log('\nExpression cleaned\n');