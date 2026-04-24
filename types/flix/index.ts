import zod, { z } from "zod";

export const FlixSubtitleSchema = zod.object({
  id: zod.number(),
  name: zod.string(),
  is_default: zod.boolean().default(false),
  srclng: zod.string().default("en"),
  subtitle: zod.string(),
  subtitle_exists: zod.boolean().default(false),
});

export const FlixMediaSchema = zod.object({
  extension: zod.string().default("mp4"),
  has_video: zod.boolean().nullable().default(false),
  video_path: zod.string(),
  video_url: zod.string(),
  subtitles: zod.array(FlixSubtitleSchema),
});

export const FlixGenreSchema = zod.object({
  tmdb_id: zod.string(),
  name: zod.string(),
  movie_count: zod.number(),
  series_count: zod.number(),
});

export const FlixBaseSchema = zod.object({
  id: zod.string(),
  title: zod.string(),
  tmdb_id: zod.string(),
  poster_path: zod.string().nullable(),
  date_release: zod.string().nullable(),
  date_upload: zod.string(),
  genres: zod.array(FlixGenreSchema),
});

export const FlixMovieSchema = FlixBaseSchema.extend({
  type: zod.literal("movie"),
}).merge(FlixMediaSchema);

export const FlixEpisodeSchema = FlixMediaSchema.extend({
  episode_number: zod.number(),
  season: zod.number(),
  title: zod.string(),
  tmdb_id: zod.string(),
});

export const FlixSeasonSchema = zod.object({
  episodes: zod.array(FlixEpisodeSchema),
  season_number: zod.number(),
  title: zod.string(),
  tmdb_id: zod.string(),
});

export const FlixSeriesSchema = FlixBaseSchema.extend({
  type: zod.literal("series"),
  seasons: zod.array(FlixSeasonSchema),
});

export const FlixUserSchema = zod.object({
  id: zod.string(),
  email: z.union([
    z.literal(""), 
    z.string().email()
  ]).optional().nullable(),
  username: zod.string(),
  can_create_flix: zod.boolean(),
});

export const FlixUserRegisterSchema = zod.object({
  username: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(6),
});

export const FlixMediaDiscSchema = zod.discriminatedUnion("type", [
  FlixMovieSchema,
  FlixSeriesSchema,
]);

export const FlixGenreFormSchema = zod.object({
  tmdb_id: zod.string(),
  name: zod.string(),
});

export const FlixMediaFormSchema = zod.object({
  title: zod.string(),
  tmdb_id: zod.string(),
  date_release: zod.string().nullable(),
  poster_path: zod.string().nullable(),
  genres: zod.array(FlixGenreFormSchema),
});

export const FlixEpisodeFormSchema = zod.object({
  title: zod.string(),
  tmdb_id: zod.string(),
  episode_number: zod.number(),
});

export const FlixSeasonFormSchema = zod.object({
  title: zod.string(),
  season_number: zod.number(),
  tmdb_id: zod.string(),
});

export const JWTResponseSchema = zod.object({
  refresh: zod.string(),
  access: zod.string(),
  access_expiration: zod.number(), // Unix timestamp in seconds
  refresh_expiration: zod.number(), // Unix timestamp in seconds
});

export const FlixSubtitleFormSchema = zod.object({
  id: zod.string(),
  subtitle: zod.union([zod.instanceof(File), zod.string()]).optional(),
  name: zod.string(),
  is_default: zod.boolean().default(false),
  srclng: zod.string().default("en"),
});

export interface FlixResponse<T> {
  number: number;
  results: T[];
  next_page_number: number;
  previous_page_number: number;
  total_pages: number;
}

export type FlixMediaType = "movie" | "series" | "all";

export type FlixTypeMap = {
  movie: FlixMovie;
  series: FlixSeries;
};

export type FlixGenre = z.infer<typeof FlixGenreSchema>;

export type FlixSubtitle = z.infer<typeof FlixSubtitleSchema>;

export type FlixMedia = z.infer<typeof FlixMediaSchema>;

export type FlixBase = z.infer<typeof FlixBaseSchema>;

export type FlixMovie = z.infer<typeof FlixMovieSchema>;

export type FlixEpisode = z.infer<typeof FlixEpisodeSchema>;

export type FlixSeason = z.infer<typeof FlixSeasonSchema>;

export type FlixSeries = z.infer<typeof FlixSeriesSchema>;

export interface FlixBrowseFilters {
  query: string;
  type: FlixMediaType;
  genre: number | null;
  sort_by: string;
  year: number | null;
  page: number;
}

export type FlixUser = z.infer<typeof FlixUserSchema>;

export type JWTResponse = z.infer<typeof JWTResponseSchema>;

export type FlixUserRegister = z.infer<typeof FlixUserRegisterSchema>;

export type FlixGenreForm = z.infer<typeof FlixGenreFormSchema>;

export type FlixMediaForm = z.infer<typeof FlixMediaFormSchema>;

export type FlixEpisodeForm = z.infer<typeof FlixEpisodeFormSchema>;

export type FlixSeasonForm = z.infer<typeof FlixSeasonFormSchema>;

export type FlixSubtitleForm = z.infer<typeof FlixSubtitleFormSchema>;