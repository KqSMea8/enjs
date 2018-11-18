const esprima = require('esprima');

const TEST_SCRIPT = require('fs').readFileSync('./demo/vars.js').toString();

const source = (function () {
  return {
    code: TEST_SCRIPT,
    ast: esprima.parse(TEST_SCRIPT)
  }
})();


// require('./do/collatz').handle(source);

// require('./do/encrypt').handle(source);

require('./do/vars').handle(source);
