"use client";

import { useEffect, useState } from "react";
import { subscribeToRoom } from "@/services/roomService";
import type { Room } from "@/types/game";
import { isFirebaseConfigured } from "@/lib/firebase";

export function useRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(Boolean(roomCode));
  const [error, setError] = useState<string | null>(() => {
    if (!roomCode) return null;
    if (!isFirebaseConfigured()) return "Firebase не настроен. Добавьте .env.local";
    return null;
  });

  useEffect(() => {
    if (!roomCode) return;
    if (!isFirebaseConfigured()) return;

    const unsub = subscribeToRoom(roomCode, (data) => {
      setRoom(data);
      setLoading(false);
      setError(data ? null : "Комната не найдена");
    });

    return () => unsub();
  }, [roomCode]);

  return { room, loading, error };
}
