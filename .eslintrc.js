module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': 'off',
    'indent': 'off',
    'no-trailing-spaces': 'off',
    'no-unused-vars': 'off',
    'comma-dangle': 'off',
    'no-extend-native': 'off',
    'semi': ['error', 'always']
  }
};

