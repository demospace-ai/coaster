module.exports = {
  extends: ["next"],
  ignorePatterns: ["postcss.config.cjs", "tailwind.config.cjs", ".eslintrc.js"],
  rules: {
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/quotes": ["error", "double", { avoidEscape: true }],
    "no-restricted-imports": [
      "error",
      {
        patterns: [".*"],
      },
    ],
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  root: true,
};
