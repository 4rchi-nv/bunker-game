"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/game";
import { getAppUrl } from "@/lib/utils";
import { removePlayer, setPlayerReady } from "@/services/roomService";

export function LobbyView({
  room,
  currentPlayerId,
  isHost,
  onStart,
  startError,
}: {
  room: Room;
  currentPlayerId: string;
  isHost: boolean;
  onStart?: () => void;
  startError?: string;
}) {
  const players = Object.values(room.players);
  const inviteUrl = `${getAppUrl()}/join?code=${room.code}`;

  const copyCode = () => navigator.clipboard.writeText(room.code);
  const copyLink = () => navigator.clipboard.writeText(inviteUrl);

  return (
    <div className="space-y-4">
      <Card className="border-amber-700/40">
        <CardHeader>
          <CardTitle>Код комнаты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center font-mono text-4xl font-bold tracking-[0.3em] text-amber-400">
            {room.code}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={copyCode}>
              Копировать код
            </Button>
            <Button variant="outline" className="flex-1" onClick={copyLink}>
              Копировать ссылку
            </Button>
          </div>
          <p className="break-all text-center text-xs text-stone-500">{inviteUrl}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Игроки ({players.length}/{room.settings.maxPlayers})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-stone-700 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {p.isHost && <Badge variant="host">хост</Badge>}
                {p.isReady ? (
                  <Badge variant="ready">готов</Badge>
                ) : (
                  <Badge variant="hidden">не готов</Badge>
                )}
              </div>
              {isHost && !p.isHost && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removePlayer(room.code, p.id)}
                >
                  Удалить
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {!isHost && (
        <Button
          className="w-full"
          onClick={() =>
            setPlayerReady(
              room.code,
              currentPlayerId,
              !room.players[currentPlayerId]?.isReady
            )
          }
        >
          {room.players[currentPlayerId]?.isReady
            ? "Не готов"
            : "Готов!"}
        </Button>
      )}

      {isHost && onStart && (
        <>
          {startError && (
            <p className="rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
              {startError}
            </p>
          )}
          <Button className="w-full" size="lg" onClick={onStart}>
            Начать игру
          </Button>
        </>
      )}
    </div>
  );
}
