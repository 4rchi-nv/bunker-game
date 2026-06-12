"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/game";
import { detectConflicts } from "@/lib/game/finalStory";
import { PlayerCardView } from "@/components/cards/player-card-view";

export function FinalScreen({ room }: { room: Room }) {
  const players = Object.values(room.players);
  const finalists = players.filter((p) => !p.isEliminated);

  const conflicts = detectConflicts(finalists);

  return (
    <div className="space-y-6">
      <Card className="border-emerald-800/50">
        <CardHeader>
          <CardTitle className="text-emerald-400">🏆 Финал</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-stone-400">Прошли в бункер:</p>
          <div className="flex flex-wrap gap-2">
            {finalists.map((p) => (
              <Badge key={p.id} variant="open">
                {p.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {conflicts.length > 0 && (
        <Card className="border-red-800/50">
          <CardHeader>
            <CardTitle className="text-red-400">⚠️ Конфликты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflicts.map((c, i) => (
              <p key={i} className="text-sm text-red-300">
                {c.message}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-amber-300">
          Все карты раскрыты
        </h3>
        {players.map((p) => (
          <PlayerCardView key={p.id} player={p} isOwn={false} hideSecrets={false} />
        ))}
      </div>

      {room.settings.showFinalStory && room.game.finalStory && (
        <Card>
          <CardHeader>
            <CardTitle>📜 Финальная история</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans text-sm text-stone-300">
              {room.game.finalStory}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
