import { defineCollection, reference, z } from "astro:content";
import { BLOG_POSTS_COLUMNS, BLOG_POSTS_ROWS_SCALE } from "@data/client/constants";

// NOTE: the subdirectory of 'blog' called 'news' must be queried relative to blog/. Example: news/*.md/mdx

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(), // the page title
    description: z.string(),
    pubDatetime: z.date(),
    modDatetime: z.date(),
    thumbnail: z
      .object({
        imagePath: z.string().default(""),
        desiredWidth: z.string().default("24rem"),
        desiredHeight: z.string().default("24rem"),
      })
      .default({ imagePath: "", desiredWidth: "24rem", desiredHeight: "24rem" }),
    tags: z.array(z.string()).default([]),
    relatedPosts: z.array(reference("blog")).default([]),
    commands: z.array(z.string()).default([]),
    importanceX: z.number().default(Math.floor(BLOG_POSTS_COLUMNS / 2)), // MUST be a number between 1-10, or the negative versions if you want to ensure size
    importanceY: z.number().default(BLOG_POSTS_ROWS_SCALE), // MUST be a number between 1-10, or the negative versions if you want to ensure size
    titleTextSize: z.string().default("2xl"), // tailwind text size
    descriptionTextSize: z.string().default("base"), // tailwind text size
    draft: z.boolean(),
  }),
});

export const collections = { blog };
