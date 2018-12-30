const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const escodegen = require('escodegen');
const astHelper = require('../../utils/ast-helper');

function genDetectTemplate () {
  const randomFunction = astHelper.randomName();
  return [
    astHelper.DECLARE_FUNCTION(randomFunction, [], esprima.parse(fs.readFileSync(path.join(__dirname, './detect.js')).toString()).body.body),
    astHelper.CALL_EXPRESSION(randomFunction)
  ];
}

function handle (source) {
  const body = astHelper.getEntryScope(source.ast);
  body.splice(0, 0, ...genDetectTemplate());
  source.code = escodegen.generate(source.ast);
}

module.exports = {
  handle
};
