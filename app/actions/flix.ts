"use server";

import { resFail, resOk, withErrorHandling } from "@/lib/response-wrappers";
import { flixFetch } from "@/lib/flix-fetch";
import { FetchResponse } from "@/types";
import {
  FlixEpisodeForm,
  FlixEpisodeFormSchema,
  FlixEpisodeSchema,
  FlixMediaForm,
  FlixMediaFormSchema,
  FlixSeason,
  FlixSeasonForm,
  FlixSeasonFormSchema,
  FlixSeasonSchema,
} from "@/types/flix";
import zod from "zod";

async function handleResponse<T>(
  response: Response,
  schema?: zod.ZodSchema,
): Promise<FetchResponse<T>> {
  if (!response.ok) {
    return resFail({
      message: `Request failed with status ${response.status}`,
      status: response.status,
    });
  }

  const jsonData = await response.json();

  if (schema) {
    const parseResult = schema.safeParse(jsonData);

    if (!parseResult.success) {
      console.error("Response validation error:", parseResult.error);
      return resFail({
        message: "Invalid response data",
        status: 500,
      });
    }

    return resOk(parseResult.data, response.status);
  }

  return resOk(jsonData, response.status);
}

export const createFlixMedia = withErrorHandling(
  async (
    isMovie: boolean,
    flixMediaData: FlixMediaForm,
  ): Promise<FetchResponse<any>> => {
    const flixMediaResult = FlixMediaFormSchema.safeParse(flixMediaData);

    if (!flixMediaResult.success) {
      return resFail({
        message: "Invalid media data",
        status: 400,
      });
    }

    const formData = new FormData();
    formData.append("title", flixMediaData.title);
    formData.append("tmdb_id", flixMediaData.tmdb_id);
    formData.append("date_release", flixMediaData.date_release || "");
    formData.append("poster_path", flixMediaData.poster_path || "");
    formData.append("genres", JSON.stringify(flixMediaData.genres));

    const endpoint = isMovie ? "/api/movie/" : "/api/series/";

    const response = await flixFetch(endpoint, {
      method: "POST",
      body: formData,
      ...(!isMovie && {
        body: JSON.stringify(flixMediaData),
        headers: {
          "content-type": "application/json",
        },
      }),
    });

    return handleResponse(response);
  },
);

export const createFlixSeason = withErrorHandling(
  async (
    seriesId: string,
    seasonData: FlixSeasonForm,
  ): Promise<FetchResponse<FlixSeason>> => {
    const seasonFormResult = FlixSeasonFormSchema.safeParse(seasonData);

    if (!seasonFormResult.success) {
      return resFail({
        message: "Invalid season data",
        status: 400,
      });
    }

    const response = await flixFetch(`/api/series/${seriesId}/season/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(seasonFormResult.data),
    });

    return handleResponse(response, FlixSeasonSchema);
  },
);

export const createFlixEpisode = withErrorHandling(
  async (
    seriesId: string,
    seasonNumber: number,
    episodeData: FlixEpisodeForm,
  ): Promise<FetchResponse<any>> => {
    const episodeFormResult = FlixEpisodeFormSchema.safeParse(episodeData);

    if (!episodeFormResult.success) {
      return resFail({
        message: "Invalid episode data",
        status: 400,
      });
    }

    const response = await flixFetch(
      `/api/series/${seriesId}/season/${seasonNumber}/episode/`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(episodeFormResult.data),
      },
    );

    return handleResponse(response, FlixEpisodeSchema);
  },
);