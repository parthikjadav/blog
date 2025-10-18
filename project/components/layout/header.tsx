import Link from "next/link";
import Image from "next/image";

import { siteConfig } from "@/data/site-config";
import { HeaderSearch } from "@/components/layout/header-search";
import { HeaderNav } from "@/components/layout/header-nav";

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
            aria-label="Home"
          >
            {/* Light mode logo (white) */}
            <Image
              src="/images/white-fast-tech-favicon.svg"
              alt={siteConfig.name}
              width={32}
              height={32}
              className="hidden dark:block"
              priority
            />
            {/* Dark mode logo (dark) */}
            <Image
              src="/images/dark-fast-tech-favicon.svg"
              alt={siteConfig.name}
              width={32}
              height={32}
              className="dark:hidden"
              priority
            />
            <span className="font-bold text-xl">{siteConfig.name}</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md">
            <HeaderSearch />
          </div>

          {/* Navigation - Client Component */}
          <HeaderNav />
        </div>

        {/* Mobile Search - Full width below header */}
        <div className="md:hidden border-t">
          <div className="container py-2">
            <HeaderSearch />
          </div>
        </div>
      </header>
    </>
  );
}
