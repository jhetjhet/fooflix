import { fetchFlixDetails } from "@/services/flix";
import { getTMDBDetails } from "@/services/tmdb";
import { TMDBTypeMap } from "@/types/tmdb";
import { FlixTypeMap } from "@/types/flix";
import useSWR from "swr";

const tmdbTypeMap = {
  movie: "movie",
  series: "tv",
} as const;

type TMDBKeyFor<T extends keyof FlixTypeMap> = (typeof tmdbTypeMap)[T];

interface TMDBFlixData<T extends keyof FlixTypeMap> {
  tmdb: TMDBTypeMap[TMDBKeyFor<T>] | undefined;
  flix: FlixTypeMap[T] | undefined;
  isLoading: boolean;
  error: Error;
  mutateFlix: () => void;
}

export default function useTMDBFlix<T extends keyof FlixTypeMap>(
  type: T,
  id: number,
): TMDBFlixData<T> {
  const tmdbType = tmdbTypeMap[type];

  const {
    data: tmdbMovie,
    isLoading: tmdbLoading,
    error: tmdbError,
  } = useSWR<TMDBTypeMap[TMDBKeyFor<T>]>(`tmdb-${tmdbType}-${id}`, () =>
    getTMDBDetails({
      type: tmdbType,
      id: id,
    }),
  );

  const {
    data: flixMovie,
    isLoading: flixLoading,
    error: flixError,
    mutate: mutateFlix,
  } = useSWR<FlixTypeMap[T]>(`flix-${type}-${id}`, () =>
    fetchFlixDetails({
      type,
      id: id.toString(),
    }),
  );

  return {
    tmdb: tmdbMovie,
    flix: flixMovie,
    isLoading: tmdbLoading || flixLoading,
    error: tmdbError || flixError,
    mutateFlix,
  };
}