module.exports = {
  extends: [],
  ignorePatterns: ["postcss.config.cjs", "tailwind.config.cjs", ".eslintrc.js"],
  rules: {
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/quotes": ["error", "double"],
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  root: true,
};
