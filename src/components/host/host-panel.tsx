"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Room } from "@/types/game";
import { CHARACTERISTIC_LABELS } from "@/data/roundConfig";
import type { CharacteristicType } from "@/types/game";
import {
  setPhase,
  startDiscussion,
  showRoundEvents,
  startVoting,
  eliminatePlayer,
  nextRound,
  confirmActionCard,
  setRevealCharacteristic,
  revealPlayerCharacteristic,
} from "@/services/gameService";
import { PHASE_LABELS } from "@/lib/game/labels";

export function HostPanel({
  room,
  pendingActionPlayerId,
  onClearPendingAction,
}: {
  room: Room;
  pendingActionPlayerId?: string | null;
  onClearPendingAction?: () => void;
}) {
  const [hostNote, setHostNote] = useState("");
  const [selectedEliminate, setSelectedEliminate] = useState("");
  const active = Object.values(room.players).filter((p) => !p.isEliminated);
  const phase = room.game.phase;

  const handleConfirmAction = async (approved: boolean) => {
    if (!pendingActionPlayerId) return;
    await confirmActionCard(room.code, pendingActionPlayerId, approved, hostNote);
    setHostNote("");
    onClearPendingAction?.();
  };

  return (
    <Card className="border-amber-700/40 bg-amber-950/10">
      <CardHeader>
        <CardTitle>🎛️ Панель хоста</CardTitle>
        <p className="text-sm text-stone-400">
          Фаза: {PHASE_LABELS[phase]} · Раунд {room.game.currentRound}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {phase === "reveal" && (
          <div className="space-y-2">
            <Label>Раскрытие характеристики</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CHARACTERISTIC_LABELS) as CharacteristicType[]).map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant="outline"
                  onClick={() => setRevealCharacteristic(room.code, c)}
                >
                  {CHARACTERISTIC_LABELS[c]}
                </Button>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() => setPhase(room.code, "discussion").then(() =>
                startDiscussion(room.code)
              )}
            >
              Начать обсуждение
            </Button>
            {active.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant="secondary"
                className="mr-2"
                onClick={() => {
                  const chars = room.game.currentReveal;
                  const list = Array.isArray(chars) ? chars : [chars];
                  list.forEach((c) => revealPlayerCharacteristic(room.code, p.id, c));
                }}
              >
                {p.name}: раскрыть
              </Button>
            ))}
          </div>
        )}

        {phase === "discussion" && (
          <Button className="w-full" onClick={() => showRoundEvents(room.code)}>
            Завершить обсуждение → События
          </Button>
        )}

        {phase === "events" && (
          <Button className="w-full" onClick={() => setPhase(room.code, "actions")}>
            → Action-карты
          </Button>
        )}

        {phase === "actions" && (
          <>
            {pendingActionPlayerId && (
              <div className="rounded-lg border border-purple-700 p-3 space-y-2">
                <p className="text-sm text-purple-300">
                  Запрос на action-карту от{" "}
                  {room.players[pendingActionPlayerId]?.name}
                </p>
                <Input
                  placeholder="Комментарий хоста"
                  value={hostNote}
                  onChange={(e) => setHostNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleConfirmAction(true)}>
                    Подтвердить
                  </Button>
                  <Button
                    className="flex-1"
                    variant="danger"
                    onClick={() => handleConfirmAction(false)}
                  >
                    Отклонить
                  </Button>
                </div>
              </div>
            )}
            <Button className="w-full" onClick={() => startVoting(room.code)}>
              → Голосование
            </Button>
          </>
        )}

        {phase === "voting" && (
          <div className="space-y-2">
            <Label>Результаты голосования</Label>
            {Object.entries(room.game.voteResults || {}).map(([id, count]) => (
              <p key={id} className="text-sm">
                {room.players[id]?.name}: {count} голос(ов)
              </p>
            ))}
            <select
              className="w-full rounded-lg border border-stone-600 bg-stone-950 p-2 text-stone-100"
              value={selectedEliminate}
              onChange={(e) => setSelectedEliminate(e.target.value)}
            >
              <option value="">Кого изгнать?</option>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button
              className="w-full"
              variant="danger"
              disabled={!selectedEliminate}
              onClick={async () => {
                await eliminatePlayer(room.code, selectedEliminate);
                setSelectedEliminate("");
              }}
            >
              Исключить игрока
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => startVoting(room.code)}
            >
              Переголосование
            </Button>
            <Button className="w-full" onClick={() => nextRound(room.code)}>
              Следующий раунд
            </Button>
          </div>
        )}

        {phase === "final" && (
          <p className="text-emerald-400">Игра завершена!</p>
        )}
      </CardContent>
    </Card>
  );
}
