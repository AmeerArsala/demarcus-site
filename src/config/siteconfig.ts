// NOTE: do NOT put stuff in here that is unsafe to be exposed to the client

export type Site = {
  title: string;
  blogRoute: string;
  website: string;
  author: string;
  desc: string;
  ogImage?: string;
  backgroundColor: (darkMode: boolean) => string;
};

export const SITE: Site = {
  title: "Demarcus",
  website: "https://demarcus.xyz",
  blogRoute: "docs",
  author: "Ameer Arsala",
  desc: "Open Source Disqus",
  //ogImage: "og.png", // no manual og image for now

  // This is for theme switching
  backgroundColor: (darkMode: boolean) => (darkMode ? "#171717" : "#ffffff"),
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

const SITE_DELIMITER: string = " | ";

export function appendSiteSuffix(title: string): string {
  return title + SITE_DELIMITER + SITE.title;
}
