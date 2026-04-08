"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Search, Film, Tv, ChevronRight, Star, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadForm } from "@/components/upload-form";
import {
  searchMovies,
  searchTVShows,
  getMovieGenres,
  getTVGenres,
  getTVSeasonDetails,
  getImageUrl,
} from "@/services/tmdb";
import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBGenre,
  TMDBEpisode,
  MediaType,
} from "@/types/tmdb";
import { cn } from "@/lib/utils";

// Fetch genres
const fetchGenres = async (): Promise<TMDBGenre[]> => {
  const [movieGenres, tvGenres] = await Promise.all([
    getMovieGenres(),
    getTVGenres(),
  ]);

  const allGenres = [...movieGenres.genres, ...tvGenres.genres];
  return allGenres.filter(
    (genre, index, self) => self.findIndex((g) => g.id === genre.id) === index,
  );
};

export default function CreatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie");
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
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const { data: genres = [] } = useSWR("create-genres", fetchGenres);

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
    setEpisodes([]);
  };

  const handleSelectSeason = async (tvId: number, seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(null);
    setLoadingEpisodes(true);

    try {
      const seasonDetails = await getTVSeasonDetails(tvId, seasonNumber);
      setEpisodes(seasonDetails.episodes);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleSelectEpisode = (episode: TMDBEpisode) => {
    setSelectedEpisode(episode);
  };

  const getGenreNames = (genreIds: number[]): string => {
    return genreIds
      .slice(0, 3)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const isMovie = (item: TMDBMovie | TMDBTVShow): item is TMDBMovie => {
    return "title" in item;
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
            onValueChange={(value: "movie" | "tv") => {
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
        {/* Left Column - Search Results */}
        <div className="lg:flex-1">
          <h2 className="text-lg font-semibold mb-4">
            {searchResults.length > 0
              ? `Search Results (${searchResults.length})`
              : "Search Results"}
          </h2>

          {isSearching ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
              <Search className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No results yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Search for movies or series to get started with content
                management
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={cn(
                    "w-full flex items-start gap-4 p-3 rounded-lg text-left transition-colors",
                    selectedItem?.id === item.id
                      ? "bg-primary/10 border border-primary"
                      : "bg-card border border-border hover:bg-card/80",
                  )}
                >
                  {/* Poster */}
                  <div className="w-16 h-24 rounded overflow-hidden bg-muted shrink-0">
                    {(isMovie(item) ? item.poster_path : item.poster_path) ? (
                      <img
                        src={getImageUrl(
                          isMovie(item) ? item.poster_path : item.poster_path,
                          "w92",
                        )}
                        alt={isMovie(item) ? item.title : item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {searchType === "movie" ? (
                          <Film className="size-6 text-muted-foreground" />
                        ) : (
                          <Tv className="size-6 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-clamp-1">
                      {isMovie(item) ? item.title : item.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {item.vote_average > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="size-3 text-yellow-500 fill-yellow-500" />
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                      {(isMovie(item)
                        ? item.release_date
                        : item.first_air_date) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(
                            isMovie(item)
                              ? item.release_date
                              : item.first_air_date,
                          ).getFullYear()}
                        </span>
                      )}
                    </div>
                    {item.genre_ids && item.genre_ids.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {getGenreNames(item.genre_ids)}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {item.overview || "No description available."}
                    </p>
                  </div>

                  <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Upload Form */}
        <div className="lg:w-[480px] shrink-0">
          {selectedItem ? (
            <div className="space-y-6">
              {/* Selected Item Info */}
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-28 rounded overflow-hidden bg-muted shrink-0">
                    <img
                      src={getImageUrl(
                        isMovie(selectedItem)
                          ? selectedItem.poster_path
                          : selectedItem.poster_path,
                        "w154",
                      )}
                      alt={
                        isMovie(selectedItem)
                          ? selectedItem.title
                          : selectedItem.name
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary text-primary-foreground uppercase">
                        {searchType === "movie" ? "Movie" : "Series"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold line-clamp-2">
                      {isMovie(selectedItem)
                        ? selectedItem.title
                        : selectedItem.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {selectedItem.vote_average > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="size-3 text-yellow-500 fill-yellow-500" />
                          {selectedItem.vote_average.toFixed(1)}
                        </span>
                      )}
                      {(isMovie(selectedItem)
                        ? selectedItem.release_date
                        : selectedItem.first_air_date) && (
                        <span>
                          {new Date(
                            isMovie(selectedItem)
                              ? selectedItem.release_date
                              : selectedItem.first_air_date,
                          ).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Form - Movie */}
              {searchType === "movie" && (
                <UploadForm
                  title={`Upload: ${(selectedItem as TMDBMovie).title}`}
                />
              )}

              {/* Upload Form - TV Series */}
              {searchType === "tv" && (
                <Tabs defaultValue="seasons" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="seasons" className="flex-1">
                      Seasons & Episodes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="seasons" className="mt-4">
                    <div className="space-y-4">
                      {/* Season Selector */}
                      <div className="flex items-center gap-3">
                        <Select
                          value={selectedSeason?.toString() || ""}
                          onValueChange={(value) =>
                            handleSelectSeason(selectedItem.id, parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a season" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(
                              (seasonNum) => (
                                <SelectItem
                                  key={seasonNum}
                                  value={seasonNum.toString()}
                                >
                                  Season {seasonNum}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Episodes List */}
                      {selectedSeason && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Episodes</h4>
                          {loadingEpisodes ? (
                            <div className="space-y-2">
                              {Array.from({
                                length: 5,
                              }).map((_, i) => (
                                <Skeleton key={i} className="h-12 rounded" />
                              ))}
                            </div>
                          ) : episodes.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              No episodes found for this season
                            </p>
                          ) : (
                            <div className="max-h-64 overflow-y-auto space-y-1">
                              {episodes.map((episode) => (
                                <button
                                  key={episode.id}
                                  onClick={() => handleSelectEpisode(episode)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm transition-colors",
                                    selectedEpisode?.id === episode.id
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted hover:bg-muted/80",
                                  )}
                                >
                                  <span className="font-mono text-xs opacity-60">
                                    E
                                    {episode.episode_number
                                      .toString()
                                      .padStart(2, "0")}
                                  </span>
                                  <span className="flex-1 line-clamp-1">
                                    {episode.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
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
                  </TabsContent>
                </Tabs>
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
