"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/data/site-config"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { cn } from "@/lib/utils"

/**
 * Client component for navigation with active state tracking
 */
export function HeaderNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-4 md:gap-6 ml-auto">
      {siteConfig.navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-all duration-200 hidden sm:block relative group",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.name}
            {/* Active indicator underline */}
            <span
              className={cn(
                "absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary transition-all duration-200",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
              )}
            />
          </Link>
        )
      })}
      <ThemeToggle />
    </nav>
  )
}
