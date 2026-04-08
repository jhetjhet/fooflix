import { MediaType, TMDBGenre, TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { Search, Film, Tv, ChevronRight, Star, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { getImageUrl, getMovieGenres, getTVGenres, isMovie } from "@/services/tmdb";
import { useCallback, useMemo } from "react";

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

type SearchResultsProps = {
  searchResults: (TMDBMovie | TMDBTVShow)[];
  isSearching: boolean;
  searchType: MediaType;
  selectedItem: TMDBMovie | TMDBTVShow | null;
  handleSelectItem: (item: TMDBMovie | TMDBTVShow) => void;
};

export default function SearchResults({
  searchResults,
  isSearching,
  searchType,
  selectedItem,
  handleSelectItem,
}: SearchResultsProps) {
  const { data: genres = [] } = useSWR("create-genres", fetchGenres);

  const genreMaps = useMemo(() => {
    return genres.reduce(
      (acc, genre) => {
        acc[genre.id] = genre.name;
        return acc;
      },
      {} as Record<number, string>,
    );
  }, [genres]);

  const getGenreNames = useCallback(
    (genreIds: number[]): string => {
      return genreIds
        .slice(0, 3)
        .map((id) => genreMaps[id])
        .filter(Boolean)
        .join(", ");
    },
    [genreMaps],
  );

  return (
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
            Search for movies or series to get started with content management
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchResults.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className={cn(
                "w-full flex items-start gap-4 p-3 rounded-lg text-left transition-colors cursor-pointer",
                selectedItem?.id === item.id
                  ? "bg-primary/10 border border-primary"
                  : "bg-card border border-border hover:bg-card/80",
              )}
            >
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
                        isMovie(item) ? item.release_date : item.first_air_date,
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
  );
}
