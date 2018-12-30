const esprima = require('esprima');

function obfuscate (sourceCode, options) {
  const source = {
    code: sourceCode,
    ast: esprima.parse(sourceCode),
    options: {
      collatz: true,
      flow: true,
      vars: true,
      uglify: true,
      unicode: true,
      antiTamper: true
    },
  };
  Object.assign(source.options, options);

  if (source.options.antiTamper) {
    require('./transformation/anti-tamper').handle(source);
  }

  if (source.options.collatz) {
    require('./transformation/collatz').handle(source);
  }

  if (source.options.flow) {
    require('./transformation/flow').handle(source);
  }

  if (source.options.vars) {
    require('./transformation/vars').handle(source);
  }

  if (source.options.uglify) {
    require('./transformation/uglify').handle(source);
  }

  if (source.options.unicode) {
    require('./transformation/unicode').handle(source);
  }

  return source.code;
}

module.exports = {
  exec: obfuscate
};
