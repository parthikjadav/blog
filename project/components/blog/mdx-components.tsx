"use client";

import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Pre wrapper component with copy functionality
 */
function Pre({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Extract text content from the code block
    const extractText = (node: any): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (node?.props?.children) return extractText(node.props.children);
      return "";
    };

    const code = children?.props?.children || children;
    const textContent = extractText(code).trim();

    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Failed to copy - silently fail in production
      // TODO: Add user-friendly error notification
    }
  };

  return (
    <>
      {/* Copy Button with Success State - Positioned absolutely within pre */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
        {copied && (
          <span className="text-xs font-semibold text-green-400 bg-green-950/80 px-2 py-1 rounded-md shadow-lg animate-in fade-in slide-in-from-right-2 duration-200">
            Copied!
          </span>
        )}
        <button
          onClick={handleCopy}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 border shadow-lg
            ${
              copied
                ? "bg-green-500/20 border-green-500/50 text-green-400 scale-105"
                : "bg-zinc-800/95 border-zinc-700/50 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white hover:scale-105"
            }
          `}
          aria-label={copied ? "Code copied!" : "Copy code"}
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <pre {...props}>{children}</pre>
    </>
  );
}

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mt-8 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children, id, ...props }) => (
    <h2
      id={id}
      className="scroll-m-20 text-3xl font-semibold tracking-tight mt-6 mb-3"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }) => (
    <h3
      id={id}
      className="scroll-m-20 text-2xl font-semibold tracking-tight mt-4 mb-2"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-3 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-4 mb-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <Link
      href={href || "#"}
      className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
    >
      {children}
    </Link>
  ),
  ul: ({ children }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: any) => {
    // Inline code (no language class)
    if (!className) {
      return (
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {children}
        </code>
      );
    }
    // Code block (handled by pre with rehype-pretty-code)
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: Pre,
  img: ({ src, alt }) => (
    <Image
      src={src || ""}
      alt={alt || ""}
      width={800}
      height={400}
      className="rounded-lg my-6"
    />
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: ({ children }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  ),
};
