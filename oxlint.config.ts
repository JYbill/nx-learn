import { defineConfig } from "oxlint";

export default defineConfig({
  env: {
    node: true,
  },
  plugins: ["typescript"],
  jsPlugins: ["@nx/oxlint/boundaries-plugin"],
  categories: {
    correctness: "error",
  },
  ignorePatterns: ["**/*.d.ts"],
  options: {
    typeAware: true,
  },
  rules: {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        enforceBuildableLibDependency: true,
        depConstraints: [],
      },
    ],
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        fix: {
          imports: "safe-fix",
          variables: "safe-fix",
        },
      },
    ],
  },
});
