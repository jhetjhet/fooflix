import zod from "zod";

export const WTRoomSchema = zod.object({
  currentTime: zod.number(),
  hasActiveHost: zod.boolean(),
  isHost: zod.boolean(),
  isPlaying: zod.boolean(),
  movieId: zod.string(),
  roomId: zod.string(),
  syncInterval: zod.number(),
});

export const WTRoomStateSchema = zod.object({
  roomId: zod.string(),
  isHost: zod.boolean(),
  hasActiveHost: zod.boolean(),
  isPlaying: zod.boolean(),
  currentTime: zod.number(),
  awaitingSync: zod.boolean(),
});

export const WTEventDataSchema = zod.object({
  roomId: zod.string(),
  time: zod.number(),
  isPlaying: zod.boolean().optional(),
  serverTime: zod.number(),
  targetSocketId: zod.string().optional(),
  request: zod.boolean().optional(),
});

export type WTEventData = zod.infer<typeof WTEventDataSchema>;

export type WTRoomState = zod.infer<typeof WTRoomStateSchema>;

export type WTEventType = "play" | "pause" | "seek" | "sync";

export type WTRoom = zod.infer<typeof WTRoomSchema>;