"use client";

import {
  WTEventData,
  WTEventType,
  WTRoomState,
  WTUserEvent,
  WTUserEventSchema,
} from "@/types/watch-together";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

type WTEventState = {
  type: WTEventType;
  data: WTEventData;
};

type WTControlsReturn = {
  syncState: WTEventData | null;
  eventState: WTEventState | null;
  roomState: WTRoomState | null;
  users: WTUserEvent[];
  newUser: WTUserEvent | null;
  userLeft: WTUserEvent | null;
  socketSyncRequesterId: string | null;
  emitEvent: (event: string, ...args: any) => void;
  emitWTEvent: (type: WTEventType, data: WTEventData) => void;
};

export default function useWTControls(roomId: string): WTControlsReturn {
  const [eventState, setEventState] = useState<WTEventState | null>(null);
  const [syncState, setSyncState] = useState<WTEventData | null>(null);
  const [roomState, setRoomState] = useState<WTRoomState | null>(null);
  const [users, setUsers] = useState<WTUserEvent[]>([]);
  const [newUser, setNewUser] = useState<WTUserEvent | null>(null);
  const [userLeft, setUserLeft] = useState<WTUserEvent | null>(null);

  const [socketSyncRequesterId, setSocketSyncRequesterId] = useState<string | null>(null);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const emitEvent = (event: string, ...args: any) => {
    if (!socketRef.current) {
      console.error("Socket not initialized");
      return;
    }

    socketRef.current.emit(event, ...args);
  };

  const emitWTEvent = (type: WTEventType, data: WTEventData) => {
    emitEvent(type, data);
  };

  useEffect(() => {
    const socket = io("http://localhost/wtc", {
      path: "/node/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to watch together server");
    });

    socket.emit("join_room", { roomId });

    socket.on("room_joined", (data: WTRoomState) => {
      setRoomState(data);
    });

    socket.on("play", (data: WTEventData) => {
      setEventState({ type: "play", data });
    });

    socket.on("pause", (data: WTEventData) => {
      setEventState({ type: "pause", data });
    });

    socket.on("seek", (data: WTEventData) => {
      setEventState({ type: "seek", data });
    });

    socket.on("sync", (data: WTEventData) => {
      setSyncState(data);
    });

    socket.on("user_joined", (data: WTUserEvent) => {
      const parsed = WTUserEventSchema.safeParse(data);

      if (parsed.success) {
        setNewUser(parsed.data);
        const existingUser = users.find((u) => u.userId === parsed.data.userId);
        if (!existingUser) {
          setUsers((prev) => [...prev, parsed.data]);
        }
      }
    });

    socket.on("user_left", (data: WTUserEvent) => {
      const parsed = WTUserEventSchema.safeParse(data);

      if (parsed.success) {
        setUserLeft(parsed.data);
        setUsers((prev) => prev.filter((u) => u.userId !== parsed.data.userId));
      }
    });

    socket.on("users", (data: { roomId: string; users: WTUserEvent[] }) => {
      const validUsers = WTUserEventSchema.array().safeParse(data.users);

      if (validUsers.success) {
        setUsers(validUsers.data);
      }
    });

    socket.on("sync_request", (data: { targetSocketId: string }) => {
      setSocketSyncRequesterId(data.targetSocketId);
    });

    return () => {
      socket.off("connect");
      socket.off("room_joined");
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("sync");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("users");
      socket.off("sync_request");
      socket.disconnect();
    };
  }, [roomId]);

  return {
    syncState,
    eventState,
    roomState,
    users,
    newUser,
    userLeft,
    socketSyncRequesterId,
    emitEvent,
    emitWTEvent,
  };
}
