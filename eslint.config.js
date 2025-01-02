import eslintPluginAstro from "eslint-plugin-astro";
//import eslintPluginSvelte from "eslint-plugin-svelte";
//import vue from "eslint-plugin-vue";
import tailwind from "eslint-plugin-tailwindcss";

import eslintConfigPrettier from "eslint-config-prettier";

export default [
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["jsx-a11y-recommended"], // accessibility for astro components
  //eslintPluginSvelte.configs["flat/recommended"],
  //...vue.configs["flat/recommended"],
  ...tailwind.configs["flat/recommended"],
  //eslintPluginPrettierRecommended,
  {
    // ignore all js and ts files. Only do astro, svelte, vue
    files: ["**/*.astro", "**/*.svelte", "**/*.vue"],
    ignores: [
      "*",
      "**/*",
      "**/*.js",
      "**/*.ts",
      "**/*.jsx",
      "**/*.tsx",
      "!**/*.astro",
      "!**/*.svelte",
      "!**/*.vue",
    ],
    rules: {
      // override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off",
    },
  },
  eslintConfigPrettier,
];
