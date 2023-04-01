module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
  },
  overrides: [],
  rules: {
    indent: "off",
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double", {avoidEscape: true}],
    semi: ["error", "never"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/ban-ts-comment": [
      "error",
      "allow-with-description",
    ],
    "@typescript-eslint/no-explicit-any": "off"
  },
}
