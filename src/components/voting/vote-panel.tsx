"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "@/types/game";
import { castVote } from "@/services/gameService";

export function VotePanel({
  room,
  playerId,
}: {
  room: Room;
  playerId: string;
}) {
  const [selected, setSelected] = useState("");
  const [voted, setVoted] = useState(false);

  if (room.game.phase !== "voting") return null;

  const active = Object.values(room.players).filter(
    (p) =>
      !p.isEliminated &&
      (room.settings.allowSelfVote || p.id !== playerId)
  );

  const myVote = room.game.votes?.find((v) => v.voterId === playerId);

  const handleVote = async () => {
    if (!selected) return;
    await castVote(room.code, playerId, selected);
    setVoted(true);
  };

  return (
    <Card className="border-red-800/40">
      <CardHeader>
        <CardTitle>🗳️ Голосование</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {myVote || voted ? (
          <p className="text-sm text-stone-400">
            Вы проголосовали против{" "}
            {room.players[myVote?.targetId || selected]?.name}
          </p>
        ) : (
          <>
            <p className="text-sm text-stone-400">
              Выберите, кого изгнать из бункера:
            </p>
            <div className="space-y-2">
              {active
                .filter((p) => p.id !== playerId || room.settings.allowSelfVote)
                .map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-700 p-3 hover:border-red-700"
                  >
                    <input
                      type="radio"
                      name="vote"
                      value={p.id}
                      checked={selected === p.id}
                      onChange={() => setSelected(p.id)}
                      className="accent-red-600"
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
            </div>
            <Button
              className="w-full"
              variant="danger"
              disabled={!selected}
              onClick={handleVote}
            >
              Проголосовать
            </Button>
          </>
        )}

        {Object.keys(room.game.voteResults || {}).length > 0 && (
          <div className="border-t border-stone-700 pt-3">
            <p className="mb-2 text-xs uppercase text-stone-500">Результаты</p>
            {Object.entries(room.game.voteResults).map(([id, count]) => (
              <p key={id} className="text-sm">
                {room.players[id]?.name}: <strong>{count}</strong>
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
