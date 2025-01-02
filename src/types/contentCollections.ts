import type { CollectionEntry } from "astro:content";

type ContentPost = CollectionEntry<"docs">;
type ContentPostData = ContentPost["data"];

export type { ContentPost, ContentPostData };
