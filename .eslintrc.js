module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  plugins: ["prettier", "@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
}
