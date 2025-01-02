/*
import { defineAction } from "astro:actions";
import { z } from "zod";

export const server = {
  like: defineAction({
    input: z.object({ postId: z.string() }),
    handler: async ({ postId }) => {
      // TODO: update likes in db
      //return likes;
    },
  }),
  comment: defineAction({
    accept: "form",
    input: z.object({
      postId: z.string(),
      author: z.string(),
      body: z.string(),
    }),
    handler: async ({ postId }) => {
      // TODO: insert comments in db
      //return comment;
    },
  }),
};
*/
