module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint", "jest"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: "latest",
  },
  rules: {
    indent: "off",
    "linebreak-style": ["error", "unix"],
    quotes: [
      "error",
      "double",
      {avoidEscape: true, allowTemplateLiterals: true},
    ],
    "comma-dangle": ["error", "always-multiline"],
    semi: ["error", "never"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": "allow-with-description",
        "ts-nocheck": "allow-with-description",
        "ts-check": false,
        minimumDescriptionLength: 3,
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "no-restricted-globals": [
      "error",
      {
        name: "isFinite",
        message: "Use Number.isFinite",
      },
      {
        name: "isNaN",
        message: "Use Number.isNaN",
      },
    ],
  },
  overrides: [
    {
      files: "./packages/openapi-code-generator/**/*.ts",
      excludedFiles: "./packages/openapi-code-generator/**/*.spec.ts",
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "fs",
                message:
                  "nodejs apis must not be used outside of the generation host",
              },
            ],
            patterns: [
              {
                group: ["node:*"],
                message:
                  "nodejs apis must not be used outside of the generation host",
              },
            ],
          },
        ],
      },
    },
    {
      files: "**/*.spec.ts",
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
      env: {
        jest: true,
      },
      rules: {
        "prefer-arrow-callback": "error",
      },
    },
  ],
}
