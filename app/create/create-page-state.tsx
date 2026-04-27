"use client";

import { useState, useCallback, useEffect } from "react";
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
import {
  useSearchParams,
  useRouter,
  notFound,
} from "next/navigation";
import FlixFormManager from "@/components/flix-form-manager";
import { useAuthContext } from "@/context/authentication";
import { searchMovies, searchTVShows } from "@/lib/tmdb-api.client";

export default function CreatePageState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthContext();

  if (!user?.can_create_flix) {
    notFound();
  }

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [searchType, setSearchType] = useState<MediaType>(
    (searchParams.get("type") as MediaType) ?? "movie",
  );
  const [searchResults, setSearchResults] = useState<
    (TMDBMovie | TMDBTVShow)[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    TMDBMovie | TMDBTVShow | null
  >(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("type", searchType);

    router.replace(`/create?${params.toString()}`);

    setIsSearching(true);
    setSelectedItem(null);

    try {
      if (searchType === "movie") {
        const data = await searchMovies(searchQuery);
        setSearchResults(data.results);
      } else {
        const data = await searchTVShows(searchQuery);
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchType, router]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, []);

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
              setSearchType(value);
              setSearchResults([]);
              setSelectedItem(null);
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>

          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        <SearchResults
          searchResults={searchResults}
          isSearching={isSearching}
          searchType={searchType}
          selectedItem={selectedItem}
          handleSelectItem={handleSelectItem}
        />

        {/* Right Column - Upload Form */}
        <div className="lg:w-[480px] shrink-0">
          {selectedItem ? (
            <FlixFormManager tmdbMedia={selectedItem} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
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
