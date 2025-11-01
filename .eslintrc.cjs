module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off'
  },
  ignorePatterns: ['dist/', 'coverage/']
};
