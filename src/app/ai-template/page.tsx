"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildAiPrompt } from "@/data/aiPrompt";

export default function AiTemplatePage() {
  const [playerCount, setPlayerCount] = useState(8);
  const [copied, setCopied] = useState(false);
  const prompt = buildAiPrompt(playerCount);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <Link href="/" className="text-sm text-stone-500 hover:text-amber-400">
            ← На главную
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-amber-400">
            Шаблон для нейронки
          </h1>
          <p className="mt-2 text-stone-400">
            Скопируйте промпт в ChatGPT, Claude или Gemini для генерации сценария
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Количество игроков</Label>
              <Input
                className="mt-1 w-32"
                type="number"
                min={2}
                max={16}
                value={playerCount}
                onChange={(e) => setPlayerCount(+e.target.value)}
              />
            </div>
            <Button onClick={handleCopy}>
              {copied ? "✓ Скопировано!" : "Скопировать промпт"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Промпт</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-stone-950 p-4 text-xs text-stone-300">
              {prompt}
            </pre>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
