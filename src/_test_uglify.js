/**
 * 只能处理es5, es6需要先Babel
 */

const UglifyJS = require("uglify-js");
const code = require('fs').readFileSync('demo/demo.js').toString();
const result = UglifyJS.minify(code);
console.log('');
if (result.error !== undefined) {
  console.error(result.error); // runtime error, or `undefined` if no error
}

console.log(result.code);  // minified output: function add(n,d){return n+d}

