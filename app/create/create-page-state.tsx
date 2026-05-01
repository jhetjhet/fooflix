"use client";

import { useState, useEffect } from "react";
import { Search, Film, Tv } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TMDBMovie, TMDBTVShow, MediaType } from "@/types/tmdb";
import SearchResults from "./search-results";
import { useSearchParams, useRouter, notFound } from "next/navigation";
import FlixFormManager from "@/components/flix-form-manager";
import { useAuthContext } from "@/context/authentication";
import { searchMovies, searchTVShows } from "@/lib/tmdb-api.client";
import { MediaPagination } from "@/components/media-pagination";
import { toast } from "@/hooks/use-toast";

export default function CreatePageState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthContext();

  if (!user?.can_create_flix) {
    notFound();
  }

  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchResults, setSearchResults] = useState<
    (TMDBMovie | TMDBTVShow)[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    TMDBMovie | TMDBTVShow | null
  >(null);

  const searchQuery = searchParams.get("q") || "";
  const searchType = (searchParams.get("type") as MediaType) || "movie";
  const currentPage = Number(searchParams.get("page") || 1);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    let cancelled = false;

    async function performSearch() {
      setIsSearching(true);
      setSelectedItem(null);

      const fetchFunction =
        searchType === "movie" ? searchMovies : searchTVShows;

      try {
        const data = await fetchFunction(searchQuery, {
          page: currentPage.toString(),
        });
        
        if (cancelled) return;

        setSearchResults(data.results);
        setTotalPages(data.total_pages);
        setTotalResults(data.total_results);
      } catch (error) {
        toast({
          title: "Search Error",
          description:
            "An error occurred while searching TMDB. Please try again.",
          variant: "destructive",
        });

        setSearchResults([]);
        setTotalPages(1);
        setTotalResults(0);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, searchType, currentPage]);

  const updateURLParams = ({
    query = "",
    page = 1,
    type = "movie",
  }: {
    query?: string;
    page?: number;
    type?: MediaType;
  }) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query);
    if (type) params.set("type", type);
    if (page !== 1) params.set("page", page.toString());

    router.replace(`/create?${params.toString()}`);
  };

  const handleSelectItem = (item: TMDBMovie | TMDBTVShow) => {
    setSelectedItem(item);
  };

  return (
    <>
      {/* Search Section */}
      <div className="mb-8 p-6 rounded-lg bg-card border border-border">
        <h2 className="text-lg font-semibold mb-4">Search TMDB</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={searchType}
            onValueChange={(value: MediaType) => {
              setSearchResults([]);
              setSelectedItem(null);
              updateURLParams({ type: value, page: 1, query: inputValue });
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movie">
                <div className="flex items-center gap-2">
                  <Film className="size-4" />
                  Movies
                </div>
              </SelectItem>
              <SelectItem value="tv">
                <div className="flex items-center gap-2">
                  <Tv className="size-4" />
                  Series
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${searchType === "movie" ? "movies" : "series"}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                updateURLParams({
                  query: inputValue,
                  page: 1,
                  type: searchType,
                })
              }
              className="pl-10"
            />
          </div>

          <Button
            onClick={() =>
              updateURLParams({ query: inputValue, page: 1, type: searchType })
            }
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full">
          <MediaPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              updateURLParams({ page, query: inputValue, type: searchType });
            }}
          />

          <div className="my-3">
            <SearchResults
              searchResults={searchResults}
              totalResults={totalResults}
              isSearching={isSearching}
              searchType={searchType}
              selectedItem={selectedItem}
              handleSelectItem={handleSelectItem}
            />
          </div>
        </div>

        {/* Right Column - Upload Form */}
        <div className="lg:w-[480px] shrink-0 order-first lg:order-last">
          {selectedItem ? (
            <FlixFormManager tmdbMedia={selectedItem} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {searchType === "movie" ? (
                  <Film className="size-8 text-muted-foreground" />
                ) : (
                  <Tv className="size-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-1">Select Content</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Search and select a{" "}
                {searchType === "movie" ? "movie" : "series"} from the results
                to manage uploads
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
