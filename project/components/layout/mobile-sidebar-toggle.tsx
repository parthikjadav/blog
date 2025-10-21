"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileSidebarToggle() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isLearnPage = pathname.startsWith("/learn");

  const toggleSidebar = () => {
    const sidebar = document.getElementById("learning-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    if (sidebar && backdrop) {
      const willBeOpen = sidebar.classList.contains("hidden");

      sidebar.classList.toggle("hidden");
      backdrop.classList.toggle("hidden");
      setIsOpen(willBeOpen);

      // Prevent body scroll when sidebar is open
      if (willBeOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  };

  // Close sidebar on route change
  useEffect(() => {
    const sidebar = document.getElementById("learning-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    if (sidebar && backdrop && !sidebar.classList.contains("hidden")) {
      sidebar.classList.add("hidden");
      backdrop.classList.add("hidden");
      setIsOpen(false);
      document.body.style.overflow = "";
    }
  }, [pathname]);

  // Only show on /learn pages
  if (!isLearnPage) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop */}
      <div
        id="sidebar-backdrop"
        className="hidden lg:hidden fixed inset-0 bg-black/50 h-svh z-[55]"
        onClick={toggleSidebar}
      />
    </>
  );
}
