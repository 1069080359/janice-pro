module.exports = {
  extends: require.resolve('@umijs/max/eslint'),
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, variables: true }],
  },
  globals: {
    page: true,
    REACT_APP_ENV: true,
  },
};
