import { defineConfig } from "astro/config";
import { SITE } from "./src/config/siteconfig";

// Adapters
//import cloudflare from "@astrojs/cloudflare";
//import node from "@astrojs/node";
import vercel from "@astrojs/vercel";

// Frameworks
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

import rehypeFigure from "@microflash/rehype-figure"; // For images/figures with captions, do ![Alt text](path-to-image.jpg) https://github.com/Microflash/rehype-figure
import rehypeAutolinkHeadings from "rehype-autolink-headings"; // rehype plugin to add links from headings back to themselves.
import rehypeKatex from "rehype-katex"; // renders the LaTeX in HTML
import rehypeSlug from "rehype-slug"; // auto add id attributes to headings
// Content Transformation: remark (md) -> rehype (html) -> astro
import remarkCollapse from "remark-collapse"; // https://github.com/Rokt33r/remark-collapse (collapse with <details> <summary>Collapsed Text</summary>  yapping yapping yapping ...</details>)
import remarkEmoji from "remark-emoji"; // :skull: -> 💀 in markdown
import remarkMath from "remark-math"; // LaTeX in markdown -> pairs with rehype-katex
import remarkToc from "remark-toc"; // auto-generate table of contents

import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections"; // collapse sections of code: https://expressive-code.com/plugins/collapsible-sections/
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"; // line numbers: https://expressive-code.com/plugins/line-numbers/
// Expressive Code: https://expressive-code.com/
import expressiveCode, { type ExpressiveCodePlugin } from "astro-expressive-code";
import { pluginColorChips } from "expressive-code-color-chips"; // render colors in CSS: https://delucis.github.io/expressive-code-color-chips/

// Another thing you can do with this markdown:
/*
  Rough Notation: see https://roughnotation.com/
  Example: https://astro-theme-mia.pages.dev/posts/codable-protocol-in-swift/
  Code for example: https://github.com/infinity-ooo/astro-theme-mia/blob/main/src/content/blog/codable-protocol-in-swift.mdx?plain=1
*/

// SEO
import sitemap from "@astrojs/sitemap";
import pageInsight from "astro-page-insight";

// Dev Toolbar
import tailwindConfigViewer from "astro-tailwind-config-viewer";

const codeColorTheme = "one-dark-pro";

// INTEGRATIONS CONFIG
const Astro_Integrations = [
  tailwind({
    applyBaseStyles: false,
  }),
  svelte(),
  react({
    include: ["**/*.tsx"],
    experimentalReactChildren: false,
  }),
  // Note that you don't need ALL of expressiveCode's visual features due to shiki's transformers (see https://shiki.style/packages/transformers) which are beautiful
  expressiveCode({
    themes: [codeColorTheme],
    plugins: [
      pluginLineNumbers(),
      pluginCollapsibleSections(),
      pluginColorChips(),
    ] as ExpressiveCodePlugin[],
    defaultProps: {
      wrap: true, // word wrap by default
      showLineNumbers: false, // disable line numbers by default
    },
  }),
  mdx(),

  // SEO
  sitemap({
    lastmod: new Date(),
    filter: (page: string) => import.meta.env.DEV || !page.startsWith(`${SITE.website}/~dev`), // Do not ship ~dev pages in prod
  }),
];

// These integrations are active in DEV mode only
const Astro_Dev_Integrations = [
  // Dev Toolbar
  tailwindConfigViewer({
    endpoint: "/__tailwind",
    overlayMode: "embed", // embed it inside the page. default is "redirect"
  }),
  pageInsight(),
];

const All_Astro_Integrations = [...Astro_Integrations];

if (import.meta.env.DEV) {
  All_Astro_Integrations.push(...Astro_Dev_Integrations);
}

// FULL ASTRO CONFIG
// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  base: "/",
  trailingSlash: "never",
  build: {
    format: "file", // fuck the trailing slashes
  },
  prefetch: true,
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    isr: true,
  }),
  integrations: All_Astro_Integrations,
  markdown: {
    remarkPlugins: [
      remarkEmoji,
      remarkMath,
      [remarkToc, {}],
      [remarkCollapse, { test: "Table of contents" }],
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      rehypeFigure,
    ],
    shikiConfig: {
      theme: codeColorTheme,
      wrap: true,
    },
  },
  server: {
    port: 4321,
  },
  /** @type {import('vite').UserConfig} */
  vite: {
    resolve: {
      alias: {
        "@": "/src", // for the scss import aliaes (for example)
      },
    },
    logLevel: "info",
    build: {
      // For more meaningful error messages
      minify: false,
    },
  },
  scopedStyleStrategy: "where",
  image: {
    // Outside Images from other sites/sources are only allowed to be over https connections
    remotePatterns: [{ protocol: "https" }],
    domains: ["api.microlink.io"], // for link preview images
  },
  security: {
    // This is a security measure to prevent CSRF attacks
    checkOrigin: true,
  },
  redirects: {},
  experimental: {
    contentIntellisense: true,
    svg: { mode: "inline" },
    responsiveImages: true,
  },
});
