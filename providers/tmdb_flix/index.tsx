"use client";

import { TMDBMovieDetails } from "@/types/tmdb";
import React, { createContext, use } from "react";
import useSWR from "swr";

const TmdbFlixContext = createContext({});

export default function TmdbFlixProvider({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const movieId = parseInt(id);

  // const {
  //   data: movie,
  //   isLoading,
  //   error,
  // } = useSWR<TMDBMovieDetails>(`movie-${movieId}`, () =>
  //   getMovieDetails(movieId),
  // );

  return (
    <TmdbFlixContext.Provider value={{}}>{children}</TmdbFlixContext.Provider>
  );
}
