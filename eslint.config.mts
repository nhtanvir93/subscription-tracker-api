// eslint.config.mts
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

const jsConfig = js.configs.recommended;

export default defineConfig([
  {
    ...jsConfig,
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      ...(jsConfig.languageOptions ?? {}),
      globals: {
        ...(jsConfig.languageOptions?.globals ?? {}),
        ...globals.browser,
      },
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }]
    },
  },
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "**/*.config.js"],
  },
]);
