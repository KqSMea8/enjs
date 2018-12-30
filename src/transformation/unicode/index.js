const escodegen = require('escodegen');

function handle (source) {
  source.code = escodegen.generate(source.ast);
  const c = decodeURIComponent('%2F%2A%E2%80%AE%2A%2F');
  source.code = source.code.split('\r\n').map(e => c + e).join('\r\n');
}

module.exports = {
  handle
};
