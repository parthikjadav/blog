"use client"

import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 100,
  minimum: 0.08,
  easing: 'ease',
  speed: 400
})

function TopLoadingBarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Complete the loading bar when route changes (page loaded)
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    // Start loading on any link click
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement
      const href = target.getAttribute('href')
      
      // Only start progress for internal links
      if (href && href.startsWith('/')) {
        NProgress.start()
      }
    }

    // Start loading on browser back/forward
    const handlePopState = () => {
      NProgress.start()
    }

    // Add click listeners to all links
    const links = document.querySelectorAll('a[href^="/"]')
    links.forEach(link => {
      link.addEventListener('click', handleAnchorClick as EventListener)
    })

    // Listen for browser navigation
    window.addEventListener('popstate', handlePopState)

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleAnchorClick as EventListener)
      })
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname])
  
  return null
}

export function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <TopLoadingBarContent />
    </Suspense>
  )
}
