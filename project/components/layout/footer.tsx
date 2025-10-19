import { siteConfig } from "@/data/site-config"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {currentYear} {siteConfig.author.name}. Built with Next.js & MDX.
        </p>
        <div className="flex items-center gap-4">
          {siteConfig.links.github && (
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
