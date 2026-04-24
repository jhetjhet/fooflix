"use client";

import { WTEventData, WTEventType, WTRoomState } from "@/types/watch-together";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

type WTEventState = {
  type: WTEventType;
  data: WTEventData;
};

export default function useWTControls(roomId: string) {
  const [eventState, setEventState] = useState<WTEventState | null>(null);
  const [syncState, setSyncState] = useState<WTEventData | null>(null);
  const [roomState, setRoomState] = useState<WTRoomState | null>(null);
  const [userCount, setUserCount] = useState(0);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const emitEvent = (event: string, ...args: any) => {
    if (!socketRef.current) {
      console.error("Socket not initialized");
      return;
    }

    socketRef.current.emit(event, ...args);
  }

  const emitWTEvent = (type: WTEventType, data: WTEventData) => {
    console.log("Emitting WT Event:", type, data);
    emitEvent(type, data);
  }

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

    socket.on("user_count", ({count = 0}: {count: number}) => {
      setUserCount(count);
    });

    return () => {
      socket.off("connect");
      socket.off("room_joined");
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("sync");
      socket.off("user_count");
      socket.disconnect();
    };
  }, [roomId]);

  return {
    syncState,
    eventState,
    roomState,
    userCount,
    emitEvent,
    emitWTEvent,
  };
}
