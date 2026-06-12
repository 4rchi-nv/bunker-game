"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Player, Room } from "@/types/game";
import { submitActionCard } from "@/services/gameService";

export function ActionCardUse({
  room,
  player,
  onUsed,
}: {
  room: Room;
  player: Player;
  onUsed?: () => void;
}) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (room.game.phase !== "actions") return null;
  if (!player.card?.actionCard || player.card.actionCard.used) return null;

  const handleUse = async () => {
    await submitActionCard(room.code, player.id, note || "без комментария");
    setSent(true);
    onUsed?.();
  };

  return (
    <Card className="border-purple-800/50">
      <CardHeader>
        <CardTitle className="text-purple-300">🃏 Использовать action-карту</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{player.card.actionCard.title}</p>
        <p className="text-sm text-stone-400">{player.card.actionCard.description}</p>
        {sent ? (
          <p className="text-sm text-amber-400">
            Запрос отправлен хосту на подтверждение
          </p>
        ) : (
          <>
            <Textarea
              placeholder="Опишите, как используете карту..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button className="w-full" onClick={handleUse}>
              Использовать
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
