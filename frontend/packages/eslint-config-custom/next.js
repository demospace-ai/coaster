module.exports = {
  extends: [],
  ignorePatterns: ["postcss.config.cjs", "tailwind.config.cjs"],
  rules: {
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/quotes": ["error", "double"],
    "unicorn/filename-case": "off",
    "no-restricted-imports": ["error", {
      "patterns": [".*"]
    }],
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  root: true,
};