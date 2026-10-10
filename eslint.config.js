import js from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  // Dependencies and the generated Netscript API types
  {
    ignores: ["node_modules/**", "NetscriptDefinitions.d.ts"],
  },

  js.configs.recommended,
  tseslint.configs.recommended,

  // Netscript source files
  {
    files: ["**/*.ts"],
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      // Netscript scripts are long-running loops driven by `while (true)`
      "no-constant-condition": ["error", { checkLoops: false }],

      // Types are already enforced by `tsc --noEmit` against tsconfig.json
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "off",

      // Style conventions
      "@stylistic/semi": ["error", "always"],
    },
  },
);
