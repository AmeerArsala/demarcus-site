import type { ContentPost } from "@/types/contentCollections";

// Usage: posts.filter(defaultFilter);
function defaultFilter(post: ContentPost) {
  return import.meta.env.DEV || !post.data.draft;
}

// Usage: posts.filter(defaultFilter).sort(compareByDate);
function compareByDate(a: ContentPost, b: ContentPost, prioritizeDateModified = false): number {
  let dateValA, dateValB;
  if (prioritizeDateModified) {
    dateValA = a.data.modDatetime ?? a.data.pubDatetime;
    dateValB = b.data.modDatetime ?? b.data.pubDatetime;
  } else {
    dateValA = a.data.pubDatetime;
    dateValB = b.data.pubDatetime;
  }

  return (
    Math.floor(new Date(dateValB).getTime() / 1000) -
    Math.floor(new Date(dateValA).getTime() / 1000)
  );
}

// Usage: getUniqueTags(posts.filter(defaultFilter));
function getUniqueTags(posts: ContentPost[]): string[] {
  const tags: string[] = posts
    .flatMap((post) => post.data.tags)
    .filter((tagValue, index, self) => self.findIndex((tag) => tag === tagValue) === index)
    .sort((tagA, tagB) => tagA.localeCompare(tagB));

  return tags;
}

export { defaultFilter, compareByDate, getUniqueTags, type ContentPost };
