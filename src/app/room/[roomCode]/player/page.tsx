"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { useRoom } from "@/lib/hooks/useRoom";
import { storage } from "@/lib/storage/localStorage";
import { LobbyView } from "@/components/room/lobby";
import { PlayerCardView, RevealHint } from "@/components/cards/player-card-view";
import { GameTable } from "@/components/room/game-table";
import { VotePanel } from "@/components/voting/vote-panel";
import { ActionCardUse } from "@/components/player/action-card-use";
import { FinalScreen } from "@/components/room/final-screen";
import { revealPlayerCharacteristic } from "@/services/gameService";
import { Button } from "@/components/ui/button";
import type { CharacteristicType } from "@/types/game";
import Link from "next/link";

export default function PlayerRoomPage() {
  const params = useParams();
  const roomCode = (params.roomCode as string)?.toUpperCase();
  const { room, loading, error } = useRoom(roomCode);
  const [playerId] = useState(() => {
    const saved = storage.getPlayerRoom();
    return saved?.roomCode === roomCode ? saved.playerId : "";
  });

  if (loading) {
    return (
      <PageShell>
        <div className="py-20 text-center text-stone-500">Загрузка...</div>
      </PageShell>
    );
  }

  if (error || !room) {
    return (
      <PageShell>
        <div className="py-20 text-center text-red-400">
          {error || "Комната не найдена"}
          <div className="mt-4">
            <Link href="/join" className="text-amber-400">
              Подключиться
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!playerId || !room.players[playerId]) {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <p className="text-stone-400">Вы не в этой комнате</p>
          <Link href={`/join?code=${roomCode}`} className="text-amber-400">
            Войти
          </Link>
        </div>
      </PageShell>
    );
  }

  const player = room.players[playerId];
  const showLobby = room.status === "waiting" || room.status === "setup";
  const showGame = room.status === "playing";
  const showFinal = room.status === "finished";

  const handleReveal = async () => {
    const chars = room.game.currentReveal;
    const list = Array.isArray(chars) ? chars : [chars];
    for (const c of list) {
      await revealPlayerCharacteristic(room.code, playerId, c as CharacteristicType);
    }
  };

  return (
    <PageShell>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-amber-400">
          {player.name} · {room.code}
        </h1>
      </div>

      {showLobby && (
        <LobbyView room={room} currentPlayerId={playerId} isHost={false} />
      )}

      {showGame && (
        <div className="space-y-6">
          {room.game.phase === "reveal" && (
            <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-4">
              <RevealHint chars={room.game.currentReveal} />
              <Button className="mt-3 w-full" onClick={handleReveal}>
                Раскрыть мою характеристику
              </Button>
            </div>
          )}

          <PlayerCardView player={player} isOwn hideSecrets={false} />

          <ActionCardUse room={room} player={player} />

          <VotePanel room={room} playerId={playerId} />

          <GameTable room={room} />
        </div>
      )}

      {showFinal && <FinalScreen room={room} />}
    </PageShell>
  );
}
