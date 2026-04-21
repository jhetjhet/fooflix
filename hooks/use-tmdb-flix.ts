import { fetchFlixDetails } from "@/services/flix";
import { getTMDBDetails } from "@/services/tmdb";
import { TMDBTypeMap } from "@/types/tmdb";
import { FlixMediaType, FlixMovieSchema, FlixSeriesSchema } from "@/types/flix";
import useSWR from "swr";
import { unifiedMovie, unifiedSeries } from "@/services/unified";
import { useMemo } from "react";

const tmdbTypeMap = {
  movie: "movie",
  series: "tv",
} as const;

type TMDBFlixData =
  | {
      type: "movie";
      tmdb: TMDBTypeMap["movie"] | undefined;
      flix: ReturnType<typeof FlixMovieSchema.parse> | undefined;
      isLoading: boolean;
      error: Error | null;
      mutateFlix: () => void;
    }
  | {
      type: "series";
      tmdb: TMDBTypeMap["tv"] | undefined;
      flix: ReturnType<typeof FlixSeriesSchema.parse> | undefined;
      isLoading: boolean;
      error: Error | null;
      mutateFlix: () => void;
    };

export default function useTMDBFlix(
  type: Exclude<FlixMediaType, "all">,
  id: number | null,
): TMDBFlixData {
  const tmdbType = tmdbTypeMap[type];

  const {
    data: tmdb,
    isLoading: tmdbLoading,
    error: tmdbError,
  } = useSWR(
    id ? ["tmdb", tmdbType, id] : null,
    ([, tmdbType, tmdbId]) => getTMDBDetails({ type: tmdbType, id: tmdbId }),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    },
  );

  const {
    data: flixRaw,
    isLoading: flixLoading,
    error: flixError,
    mutate: mutateFlix,
  } = useSWR(
    id ? ["flix", type, id] : null,
    ([, flixType, flixId]) =>
      fetchFlixDetails({
        type: flixType,
        id: flixId.toString(),
      }),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    },
  );

  const flixSeries = useMemo(() => {
    if (type !== "series" || !flixRaw) return undefined;

    const res = FlixSeriesSchema.safeParse(flixRaw);
    return res.success ? res.data : undefined;
  }, [flixRaw, type]);

  const flixMovie = useMemo(() => {
    if (type !== "movie" || !flixRaw) return undefined;

    const res = FlixMovieSchema.safeParse(flixRaw);
    return res.success ? res.data : undefined;
  }, [flixRaw, type]);

  const base = {
    isLoading: tmdbLoading || flixLoading,
    error: tmdbError || flixError,
    mutateFlix,
  };

  if (type === "series") {
    return {
      type: "series",
      tmdb: tmdb as TMDBTypeMap["tv"] | undefined,
      flix: flixSeries as ReturnType<typeof FlixSeriesSchema.parse> | undefined,
      ...base,
    };
  }

  return {
    type: "movie",
    tmdb: tmdb as TMDBTypeMap["movie"] | undefined,
    flix: flixMovie as ReturnType<typeof FlixMovieSchema.parse> | undefined,
    ...base,
  };
}
