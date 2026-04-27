"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BrowseFiltersComponent } from "@/components/browse-filters";
import { MediaGrid } from "@/components/media-grid";
import type { MediaItem } from "@/types/tmdb";
import { FlixBrowseFilters } from "@/types/flix";
import { flixToMediaItem } from "@/services/flix";
import { clientFetchFlixItems } from "@/lib/flix-api.client";

const defaultFilters: FlixBrowseFilters = {
  query: "",
  type: "all",
  genre: null,
  sort_by: "-date_upload",
  year: null,
  page: 1,
};

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FlixBrowseFilters>(() => ({
    query: searchParams.get("query") || defaultFilters.query,
    type:
      (searchParams.get("type") as FlixBrowseFilters["type"]) ||
      defaultFilters.type,
    genre: searchParams.get("genre")
      ? searchParams.get("genre")
      : defaultFilters.genre,
    sort_by: searchParams.get("sort_by") || defaultFilters.sort_by,
    year: searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : defaultFilters.year,
    page: searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : defaultFilters.page,
  }));

  const [results, setResults] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch results based on filters
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      let items: MediaItem[] = [];

      const params: Record<string, string> = {
        page: filters.page.toString(),
        page_size: "42",
        ordering: filters.sort_by,
        search: filters.query,
      };

      if (filters.genre) {
        params.genre = filters.genre;
      }

      const response = await clientFetchFlixItems(filters.type, params);

      items = response.results.map(flixToMediaItem);

      setResults(items);
      setTotalPages(response.total_pages); // TMDB limits to 500 pages
    } catch (error) {
      console.error("Error fetching browse results:", error);
      setResults([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.type !== "all") params.set("type", filters.type);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.sort_by !== "popularity.desc")
      params.set("sort_by", filters.sort_by);
    if (filters.year) params.set("year", filters.year.toString());
    if (filters.page > 1) params.set("page", filters.page.toString());

    const newUrl = params.toString()
      ? `/browse?${params.toString()}`
      : "/browse";
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Fetch results when filters change
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleFiltersChange = (newFilters: Partial<FlixBrowseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-8">
        <BrowseFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />
      </div>

      {/* Results */}
      <MediaGrid items={results} isLoading={isLoading} />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {/* First page */}
            {filters.page > 3 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
                {filters.page > 4 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              </>
            )}

            {/* Page numbers around current */}
            {Array.from({ length: 5 }, (_, i) => {
              const page = filters.page - 2 + i;
              if (page < 1 || page > totalPages) return null;
              return (
                <Button
                  key={page}
                  variant={page === filters.page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}

            {/* Last page */}
            {filters.page < totalPages - 2 && (
              <>
                {filters.page < totalPages - 3 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
