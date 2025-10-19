"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";

import { BlogPost } from "@/types/blog";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  posts: BlogPost[];
}

/**
 * Client-side search bar component with live results
 * @param posts - Array of all posts to search through
 */
export function SearchBar({ posts }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BlogPost[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Search in title, description, and tags
    const searchResults = posts.filter((post) => {
      const searchTerm = debouncedQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(searchTerm) ||
        post.description.toLowerCase().includes(searchTerm) ||
        post.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm)) ||
        post.category.name.toLowerCase().includes(searchTerm)
      );
    });

    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
  }, [debouncedQuery, posts]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-10 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Search posts"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="text-sm text-muted-foreground px-2 py-1">
              {results.length} {results.length === 1 ? "result" : "results"}{" "}
              found
            </p>
            <div className="space-y-1">
              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  onClick={() => handleClear()}
                  className="block p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <h3 className="font-medium text-sm line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {post.category.name}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {post.readingTime} min read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
