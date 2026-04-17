import { fetchFlixDetails, isFlixMovie, isFlixSeries } from "@/services/flix";
import { getTMDBDetails, isMovieDetails, isTVShowDetails } from "@/services/tmdb";
import { TMDBTypeMap } from "@/types/tmdb";
import { FlixTypeMap } from "@/types/flix";
import useSWR from "swr";
import { unifiedMovie, unifiedSeries } from "@/services/unified";
import { UnifiedMovie, UnifiedSeries } from "@/types/unified";
import { useMemo } from "react";

const tmdbTypeMap = {
  movie: "movie",
  series: "tv",
} as const;

type TMDBKeyFor<T extends keyof FlixTypeMap> = (typeof tmdbTypeMap)[T];

interface TMDBFlixData<T extends keyof FlixTypeMap> {
  tmdb: TMDBTypeMap[TMDBKeyFor<T>] | undefined;
  flix: FlixTypeMap[T] | undefined;
  unified: UnifiedMovie | UnifiedSeries | null | undefined;
  isLoading: boolean;
  error: Error | null;
  mutateFlix: () => void;
}

export default function useTMDBFlix<T extends keyof FlixTypeMap>(
  type: T,
  id: number | null,
): TMDBFlixData<T> {
  const tmdbType = tmdbTypeMap[type];

  const {
    data: tmdb,
    isLoading: tmdbLoading,
    error: tmdbError,
  } = useSWR(
    id ? ['tmdb', tmdbType, id] : null,
    ([, tmdbType, tmdbId]) => getTMDBDetails({ type: tmdbType, id: tmdbId })
  )

  const {
    data: flix,
    isLoading: flixLoading,
    error: flixError,
    mutate: mutateFlix,
  } = useSWR(
    id ? ['flix', type, id] : null,
    ([, flixType, flixId]) => fetchFlixDetails({ type: flixType, id: flixId.toString() })
  );

  const unified = useMemo(() => {
    if (!tmdb) return null;

    if (isTVShowDetails(tmdb)) {
      return unifiedSeries(tmdb, flix && isFlixSeries(flix) ? flix : null);
    }

    if (isMovieDetails(tmdb)) {
      return unifiedMovie(tmdb, flix && isFlixMovie(flix) ? flix : null);
    }

    return null;
  }, [tmdb, flix]);

  return {
    tmdb: tmdb,
    flix: flix,
    unified: unified,
    isLoading: tmdbLoading || flixLoading,
    error: tmdbError || flixError,
    mutateFlix,
  };
}