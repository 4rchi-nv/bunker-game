"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_ROOM_SETTINGS,
  getDefaultBunkerSlots,
  type RoomSettings,
} from "@/types/game";
import { validateRoomSettings } from "@/lib/game/validation";
import { createRoom } from "@/services/roomService";
import { storage } from "@/lib/storage/localStorage";
import { isFirebaseConfigured } from "@/lib/firebase";
import Link from "next/link";

function loadInitialSettings(): RoomSettings {
  const saved = storage.getHostSettings<RoomSettings>();
  return saved ? { ...DEFAULT_ROOM_SETTINGS, ...saved } : DEFAULT_ROOM_SETTINGS;
}

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState(() => storage.getPlayerName());
  const [settings, setSettings] = useState<RoomSettings>(loadInitialSettings);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateMaxPlayers = (maxPlayers: number) => {
    setSettings((s) => ({
      ...s,
      maxPlayers,
      bunkerSlots: getDefaultBunkerSlots(maxPlayers),
    }));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Введите имя");
      return;
    }
    if (!isFirebaseConfigured()) {
      setError("Firebase не настроен. Создайте .env.local");
      return;
    }

    const validation = validateRoomSettings(settings);
    if (!validation.valid) {
      setError(validation.errors.join("; "));
      return;
    }

    setLoading(true);
    setError("");
    try {
      storage.setPlayerName(name.trim());
      storage.setHostSettings(settings);
      const { room } = await createRoom(name.trim(), settings);
      storage.setLastRoomCode(room.code);
      storage.setPlayerRoom(room.code, room.hostId);
      router.push(`/room/${room.code}/host`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <Link href="/" className="text-sm text-stone-500 hover:text-amber-400">
            ← На главную
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-amber-400">Создать игру</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Настройки комнаты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ваше имя (хост)</Label>
              <Input
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя ведущего"
              />
            </div>

            <div>
              <Label>Количество игроков (макс.)</Label>
              <Input
                className="mt-1"
                type="number"
                min={2}
                max={16}
                value={settings.maxPlayers}
                onChange={(e) => updateMaxPlayers(+e.target.value)}
              />
            </div>

            <div>
              <Label>Мест в бункере</Label>
              <Input
                className="mt-1"
                type="number"
                min={1}
                max={settings.maxPlayers - 1}
                value={settings.bunkerSlots}
                onChange={(e) =>
                  setSettings({ ...settings, bunkerSlots: +e.target.value })
                }
              />
              <p className="mt-1 text-xs text-stone-500">
                Должно быть меньше числа игроков
              </p>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.hostPlays}
                onChange={(e) =>
                  setSettings({ ...settings, hostPlays: e.target.checked })
                }
                className="h-5 w-5 accent-amber-600"
              />
              <span>Хост играет (не только ведёт)</span>
            </label>

            <div>
              <Label>Длительность обсуждения (мин)</Label>
              <Input
                className="mt-1"
                type="number"
                min={1}
                max={30}
                value={settings.discussionMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    discussionMinutes: +e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>Исключений за раунд</Label>
              <Input
                className="mt-1"
                type="number"
                min={1}
                max={3}
                value={settings.eliminationsPerRound}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    eliminationsPerRound: +e.target.value,
                  })
                }
              />
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.showFinalStory}
                onChange={(e) =>
                  setSettings({ ...settings, showFinalStory: e.target.checked })
                }
                className="h-5 w-5 accent-amber-600"
              />
              <span>Показывать финальную историю</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enableRoundEvents}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enableRoundEvents: e.target.checked,
                  })
                }
                className="h-5 w-5 accent-amber-600"
              />
              <span>События раунда</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.hideFriendEnemyUntilFinal}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hideFriendEnemyUntilFinal: e.target.checked,
                  })
                }
                className="h-5 w-5 accent-amber-600"
              />
              <span>Скрывать друга/врага до финала</span>
            </label>

            {error && (
              <p className="rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={loading}
              onClick={handleCreate}
            >
              {loading ? "Создание..." : "Создать комнату"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
