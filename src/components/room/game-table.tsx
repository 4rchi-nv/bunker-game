"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiscussionTimer } from "@/components/ui/timer";
import type { Room } from "@/types/game";
import { getPublicPlayerCard } from "@/services/gameService";
import { PHASE_LABELS } from "@/lib/game/labels";

export function GameTable({ room }: { room: Room }) {
  const scenario = room.scenario;
  const players = Object.values(room.players);
  const active = players.filter((p) => !p.isEliminated);
  const eliminated = players.filter((p) => p.isEliminated);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="host">Раунд {room.game.currentRound}</Badge>
        <Badge>{PHASE_LABELS[room.game.phase] || room.game.phase}</Badge>
        <Badge>
          Мест: {room.settings.bunkerSlots} / Игроков: {active.length}
        </Badge>
      </div>

      {room.game.phase === "discussion" && (
        <DiscussionTimer endsAt={room.game.discussionEndsAt} />
      )}

      {scenario && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>☢️ {scenario.disaster.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-stone-300">
              {scenario.disaster.description}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏚️ Бункер</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-stone-300">
              <p>{scenario.bunker.location}</p>
              <p>
                Глубина: {scenario.bunker.depth} · Площадь: {scenario.bunker.area}
              </p>
              <p>Автономность: {scenario.bunker.autonomy}</p>
            </CardContent>
          </Card>
        </>
      )}

      {(room.game.activeGoodEvent || room.game.activeBadEvent) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {room.game.activeGoodEvent && (
            <Card className="border-emerald-800/50">
              <CardHeader>
                <CardTitle className="text-emerald-400">✅ Хорошее событие</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{room.game.activeGoodEvent.title}</p>
                <p className="text-stone-400">{room.game.activeGoodEvent.description}</p>
              </CardContent>
            </Card>
          )}
          {room.game.activeBadEvent && (
            <Card className="border-red-800/50">
              <CardHeader>
                <CardTitle className="text-red-400">⚠️ Плохое событие</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">{room.game.activeBadEvent.title}</p>
                <p className="text-stone-400">{room.game.activeBadEvent.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Игроки за столом</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {active.map((p) => {
            const pub = getPublicPlayerCard(p, room);
            return (
              <div
                key={p.id}
                className="rounded-lg border border-stone-700 p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {p.isHost && <Badge variant="host">хост</Badge>}
                </div>
                <div className="flex flex-wrap gap-1 text-xs text-stone-400">
                  {pub?.profession && <Badge variant="open">{pub.profession}</Badge>}
                  {pub?.health && <Badge variant="open">здоровье</Badge>}
                  {pub?.baggage && <Badge variant="open">багаж</Badge>}
                  {!pub?.profession && !pub?.health && (
                    <Badge variant="hidden">карты скрыты</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {eliminated.length > 0 && (
        <Card className="border-red-900/40">
          <CardHeader>
            <CardTitle className="text-red-400">Изгнанные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eliminated.map((p) => (
                <Badge key={p.id} variant="eliminated">
                  {p.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>История</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-stone-400">
            {(room.game.gameLog || [])
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <span className="text-stone-600">
                    {new Date(e.timestamp).toLocaleTimeString("ru")}
                  </span>{" "}
                  {e.message}
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
