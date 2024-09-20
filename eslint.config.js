import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Disallow unused variables and imports
      "no-unused-vars": "warn",

      // Disallow console logs in production
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",

      // Disallow debugger in production
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
];
