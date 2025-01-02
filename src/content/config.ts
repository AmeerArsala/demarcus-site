import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(), // the page title
    pubDatetime: z.date(),
    modDatetime: z.date(),
    draft: z.boolean(),
  }),
});

export const collections = { docs };
