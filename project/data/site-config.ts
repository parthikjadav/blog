export const siteConfig = {
  name: "Fast Tech",
  description:
    "Stay ahead with the latest technology news, AI innovations, and tech trends. Your source for fast, reliable tech updates and insights.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  author: {
    name: "Fast Tech Team",
    email: "contact@fasttech.com",
    twitter: "@fasttech",
  },
  links: {
    // twitter: "https://twitter.com/fasttech",
    github: "https://github.com/parthikjadav",
  },
  navigation: [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Categories", href: "/categories" },
  ],
} as const;
