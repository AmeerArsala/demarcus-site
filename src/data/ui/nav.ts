interface NavLink {
  href: string;
  title: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", title: "Home" },
  { href: "/#blog", title: "Blog" },
  { href: "/faq", title: "FAQ" },
  { href: "/connect", title: "Connect" },
];
