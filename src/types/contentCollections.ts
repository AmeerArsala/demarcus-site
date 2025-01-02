import type { CollectionEntry } from "astro:content";

type PostData = CollectionEntry<"blog">["data"];

export type { PostData };
