module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    'import/order': 1,
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/member-delimiter-style": ["error", {
      "multiline": {"delimiter": "none"},
      "singleline": {"delimiter": "comma"},
    }],
    "comma-dangle": ["error", "always-multiline"],
    "prefer-const": "off",
    '@typescript-eslint/no-use-before-define': ["error", {"functions": false}],
    "no-console": "error",
  },
};
