import { TMDBMovieDetails, TMDBTVShowDetails } from "@/types/tmdb";
import { FlixMediaType, FlixMovie, FlixSeries } from "@/types/flix";
import useSWR from "swr";
import { clientFetchFlixDetails } from "@/lib/flix-api.client";
import { cGetTMDBDetails } from "@/lib/tmdb-api.client";

const swrOptions = {
  revalidateOnFocus: false,
  errorRetryCount: 2,
  errorRetryInterval: 3000,
} as const;

type MovieFlixData = {
  type: "movie";
  tmdb: TMDBMovieDetails | undefined;
  flix: FlixMovie | undefined;
  isLoading: boolean;
  error: Error | null;
  mutateFlix: () => void;
};

type SeriesFlixData = {
  type: "series";
  tmdb: TMDBTVShowDetails | undefined;
  flix: FlixSeries | undefined;
  isLoading: boolean;
  error: Error | null;
  mutateFlix: () => void;
};

type FlixDataMap = {
  movie: MovieFlixData;
  series: SeriesFlixData;
};

export default function useTMDBFlix<T extends Exclude<FlixMediaType, "all">>(
  type: T,
  id: number | null,
): FlixDataMap[T] {
  const {
    data: tmdbMovie,
    isLoading: tmdbMovieLoading,
    error: tmdbMovieError,
  } = useSWR(
    type === "movie" && id ? (["tmdb", "movie", id] as const) : null,
    ([, , tmdbId]) => cGetTMDBDetails({ type: "movie", id: tmdbId }),
    swrOptions,
  );

  const {
    data: tmdbSeries,
    isLoading: tmdbSeriesLoading,
    error: tmdbSeriesError,
  } = useSWR(
    type === "series" && id ? (["tmdb", "tv", id] as const) : null,
    ([, , tmdbId]) => cGetTMDBDetails({ type: "tv", id: tmdbId }),
    swrOptions,
  );

  const {
    data: flixMovie,
    isLoading: flixMovieLoading,
    error: flixMovieError,
    mutate: mutateFlixMovie,
  } = useSWR(
    type === "movie" && id ? (["flix", "movie", id] as const) : null,
    ([, , flixId]) => clientFetchFlixDetails({ type: "movie", id: flixId.toString() }),
    swrOptions,
  );

  const {
    data: flixSeries,
    isLoading: flixSeriesLoading,
    error: flixSeriesError,
    mutate: mutateFlixSeries,
  } = useSWR(
    type === "series" && id ? (["flix", "series", id] as const) : null,
    ([, , flixId]) => clientFetchFlixDetails({ type: "series", id: flixId.toString() }),
    swrOptions,
  );

  if (type === "series") {
    return {
      type: "series",
      tmdb: tmdbSeries,
      flix: flixSeries,
      isLoading: tmdbSeriesLoading || flixSeriesLoading,
      error: tmdbSeriesError || flixSeriesError,
      mutateFlix: mutateFlixSeries,
    } as unknown as FlixDataMap[T];
  }

  return {
    type: "movie",
    tmdb: tmdbMovie,
    flix: flixMovie,
    isLoading: tmdbMovieLoading || flixMovieLoading,
    error: tmdbMovieError || flixMovieError,
    mutateFlix: mutateFlixMovie,
  } as unknown as FlixDataMap[T];
}
