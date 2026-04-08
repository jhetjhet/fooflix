"use client";

import { useState, useCallback } from "react";
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
import { UploadForm } from "@/components/upload-form";
import {
  searchMovies,
  searchTVShows,
  isTVShow,
} from "@/services/tmdb";
import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBEpisode,
  MediaType,
} from "@/types/tmdb";
import UploadFormTV from "@/app/create/upload-form-tv";
import SearchResults from "./search-results";
import SelectedItemInfo from "./selected-item-info";

export default function CreatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<MediaType>("movie");
  const [searchResults, setSearchResults] = useState<
    (TMDBMovie | TMDBTVShow)[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    TMDBMovie | TMDBTVShow | null
  >(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(
    null,
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSelectedItem(null);
    setSelectedSeason(null);
    setSelectedEpisode(null);

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
  }, [searchQuery, searchType]);

  const handleSelectItem = (item: TMDBMovie | TMDBTVShow) => {
    setSelectedItem(item);
    setSelectedSeason(null);
    setSelectedEpisode(null);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Content</h1>
        <p className="text-muted-foreground">
          Search for movies or series and manage your content uploads
        </p>
      </div>

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
            <div className="space-y-6">
              {/* Selected Item Info */}
              <SelectedItemInfo tmdbMedia={selectedItem} />

              {/* Upload Form - Movie */}
              {searchType === "movie" && (
                <UploadForm
                  title={`Upload: ${(selectedItem as TMDBMovie).title}`}
                />
              )}

              {/* Upload Form - TV Series */}
              {isTVShow(selectedItem) && (
                <UploadFormTV
                  tv={selectedItem}
                  onEpisodeSelect={(episode) => setSelectedEpisode(episode)}
                />
              )}

              {/* Episode Upload Form */}
              {selectedEpisode && (
                <UploadForm
                  title={`Upload: S${selectedSeason}E${selectedEpisode.episode_number}`}
                  subtitle={selectedEpisode.name}
                  onClose={() => setSelectedEpisode(null)}
                />
              )}
            </div>
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
    </div>
  );
}
