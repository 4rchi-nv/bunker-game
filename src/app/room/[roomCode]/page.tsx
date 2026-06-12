"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { useRoom } from "@/lib/hooks/useRoom";
import { storage } from "@/lib/storage/localStorage";

export default function RoomRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string)?.toUpperCase();
  const { room, loading } = useRoom(roomCode);

  useEffect(() => {
    if (loading) return;
    const saved = storage.getPlayerRoom();
    if (room && saved?.roomCode === roomCode) {
      if (saved.playerId === room.hostId) {
        router.replace(`/room/${roomCode}/host`);
      } else {
        router.replace(`/room/${roomCode}/player`);
      }
      return;
    }
    router.replace(`/join?code=${roomCode}`);
  }, [room, loading, roomCode, router]);

  return (
    <PageShell>
      <div className="py-20 text-center text-stone-500">Загрузка комнаты...</div>
    </PageShell>
  );
}
