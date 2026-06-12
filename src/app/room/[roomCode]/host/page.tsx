"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { useRoom } from "@/lib/hooks/useRoom";
import { storage } from "@/lib/storage/localStorage";
import { LobbyView } from "@/components/room/lobby";
import { ScenarioImport } from "@/components/host/scenario-import";
import { HostPanel } from "@/components/host/host-panel";
import { GameTable } from "@/components/room/game-table";
import { FinalScreen } from "@/components/room/final-screen";
import { startGame } from "@/services/gameService";
import { canStartGame } from "@/lib/game/validation";
import { setCustomFinalStory } from "@/services/gameService";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HostRoomPage() {
  const params = useParams();
  const roomCode = (params.roomCode as string)?.toUpperCase();
  const { room, loading, error } = useRoom(roomCode);
  const [playerId] = useState(() => {
    const saved = storage.getPlayerRoom();
    return saved?.roomCode === roomCode ? saved.playerId : "";
  });
  const [startError, setStartError] = useState("");
  const [customStory, setCustomStory] = useState("");
  const [clearedActionId, setClearedActionId] = useState<string | null>(null);

  const pendingAction = useMemo(() => {
    if (!room || room.game.phase !== "actions" || !room.game.gameLog) return null;
    const lastAction = [...room.game.gameLog]
      .reverse()
      .find((e) => e.type === "action" && e.message.includes("использовал"));
    if (!lastAction?.playerId || lastAction.playerId === clearedActionId) return null;
    const player = room.players[lastAction.playerId];
    if (player?.card?.actionCard && !player.card.actionCard.used) {
      return lastAction.playerId;
    }
    return null;
  }, [room, clearedActionId]);

  const handleStart = async () => {
    if (!room) return;
    const check = canStartGame(room);
    if (!check.valid) {
      setStartError(check.errors.join("; "));
      return;
    }
    setStartError("");
    try {
      await startGame(room.code);
    } catch (e) {
      setStartError(e instanceof Error ? e.message : "Ошибка старта");
    }
  };

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
        </div>
      </PageShell>
    );
  }

  const isHost = playerId === room.hostId;
  if (!isHost) {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <p className="text-stone-400">Вы не хост этой комнаты</p>
          <Link href={`/room/${roomCode}/player`} className="text-amber-400">
            Перейти как игрок
          </Link>
        </div>
      </PageShell>
    );
  }

  const showLobby = room.status === "waiting" || room.status === "setup";
  const showGame = room.status === "playing";
  const showFinal = room.status === "finished";

  return (
    <PageShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-amber-400">
          Комната {room.code} · Хост
        </h1>
        <BadgeStatus status={room.status} />
      </div>

      {showLobby && (
        <div className="space-y-6">
          <LobbyView
            room={room}
            currentPlayerId={playerId}
            isHost
            onStart={room.scenarioImported ? handleStart : undefined}
            startError={startError}
          />
          {!room.scenarioImported && (
            <ScenarioImport
              roomCode={room.code}
              playerCount={Object.keys(room.players).length}
            />
          )}
          {room.scenarioImported && !startError && (
            <p className="text-center text-sm text-emerald-400">
              ✓ Сценарий импортирован — можно начинать
            </p>
          )}
        </div>
      )}

      {showGame && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <HostPanel
              room={room}
              pendingActionPlayerId={pendingAction}
              onClearPendingAction={() =>
                pendingAction && setClearedActionId(pendingAction)
              }
            />
            {room.game.phase === "final" && <FinalScreen room={room} />}
          </div>
          <GameTable room={room} />
        </div>
      )}

      {showFinal && (
        <div className="space-y-6">
          <FinalScreen room={room} />
          <div className="space-y-2">
            <p className="text-sm text-stone-400">
              Вставьте финальную историю от нейросети (опционально):
            </p>
            <Textarea
              value={customStory}
              onChange={(e) => setCustomStory(e.target.value)}
              placeholder="Финальная история от ИИ..."
            />
            <Button
              onClick={() => setCustomFinalStory(room.code, customStory)}
            >
              Сохранить историю
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function BadgeStatus({ status }: { status: string }) {
  const colors: Record<string, string> = {
    waiting: "text-stone-400",
    setup: "text-amber-400",
    playing: "text-emerald-400",
    finished: "text-purple-400",
  };
  return (
    <span className={`text-sm ${colors[status] || ""}`}>
      {status === "waiting" && "Ожидание"}
      {status === "setup" && "Настройка"}
      {status === "playing" && "Игра"}
      {status === "finished" && "Завершено"}
    </span>
  );
}
