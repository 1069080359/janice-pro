module.exports = {
  extends: require.resolve('@umijs/max/stylelint'),
  rules: {
    'color-function-notation': 'legacy',
    'value-keyword-case': ['lower', { ignoreProperties: ['composes', 'fade'] }],
    'alpha-value-notation': 'number',
    'color-hex-length': 'short',
  },
};
