import { type CollectionEntry, getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { SITE } from "@config/siteconfig";
import { compareByDate, defaultFilter } from "@utils/content/helpers";

export const GET = async ({ params }) => {
  const posts = await getCollection("blog");

  // All available posts, sorted by date
  const sortedPosts: CollectionEntry<"blog">[] = posts.filter(defaultFilter).sort(compareByDate);

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    trailingSlash: false,
    items: sortedPosts.map((post: CollectionEntry<"blog">) => ({
      link: `blog/${post.slug}`,
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.modDatetime ?? post.data.pubDatetime),
    })),
  });
};
