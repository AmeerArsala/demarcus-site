import { SITE } from "@config/siteconfig";
import type { APIRoute } from "astro";

const robots = `
User-agent: *
Allow: /
Disallow: /~dev/
Disallow: /~api/
Disallow: /~private/

Sitemap: ${new URL("sitemap-index.xml", SITE.website).href}
`.trim();

export const GET: APIRoute = async ({ params }) =>
  new Response(robots, {
    headers: { "Content-Type": "text/plain" },
  });
