"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinRoom } from "@/services/roomService";
import { storage } from "@/lib/storage/localStorage";
import { isFirebaseConfigured } from "@/lib/firebase";
import Link from "next/link";

function resolveInitialCode(searchParams: URLSearchParams): string {
  const urlCode = searchParams.get("code");
  if (urlCode) return urlCode.toUpperCase();
  return storage.getLastRoomCode();
}

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(() => resolveInitialCode(searchParams));
  const [name, setName] = useState(() => storage.getPlayerName());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || !name.trim()) {
      setError("Введите код и имя");
      return;
    }
    if (!isFirebaseConfigured()) {
      setError("Firebase не настроен");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { playerId, room } = await joinRoom(code.trim().toUpperCase(), name.trim());
      storage.setPlayerName(name.trim());
      storage.setPlayerRoom(room.code, playerId);
      const isHost = playerId === room.hostId;
      router.push(
        isHost
          ? `/room/${room.code}/host`
          : `/room/${room.code}/player`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось подключиться");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <Link href="/" className="text-sm text-stone-500 hover:text-amber-400">
            ← На главную
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-amber-400">Подключиться</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Код комнаты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Код (6 символов)</Label>
              <Input
                className="mt-1 text-center text-2xl font-mono tracking-widest uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="ABC123"
              />
            </div>
            <div>
              <Label>Ваше имя</Label>
              <Input
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-950/50 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={loading}
              onClick={handleJoin}
            >
              {loading ? "Подключение..." : "Войти в комнату"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<PageShell><div className="py-20 text-center">Загрузка...</div></PageShell>}>
      <JoinForm />
    </Suspense>
  );
}
