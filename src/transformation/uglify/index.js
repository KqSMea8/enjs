/**
 * 只能处理es5, es6需要先Babel
 */
const UglifyJS = require('uglify-js');
const escodegen = require('escodegen');
const esprima = require('esprima');

function handle (source) {
  const sourceCode = escodegen.generate(source.ast);
  const result = UglifyJS.minify(sourceCode);
  if (result.error !== undefined) {
    console.log(sourceCode);
    console.error(result.error); // runtime error, or `undefined` if no error
    return false;
  }
  source.ast = esprima.parse(result.code);
  return true;
}

module.exports = {
  handle
};
