"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { parseScenario, scenarioToJson } from "@/lib/parser/scenarioParser";
import { validateScenario } from "@/lib/game/validation";
import { importScenario } from "@/services/roomService";
import { demoScenario } from "@/data/demoScenario";
import { storage } from "@/lib/storage/localStorage";
import type { Scenario } from "@/types/scenario";
import { resolvePlayerTargets } from "@/lib/game/validation";

export function ScenarioImport({
  roomCode,
  playerCount,
  onImported,
}: {
  roomCode: string;
  playerCount: number;
  onImported?: () => void;
}) {
  const [raw, setRaw] = useState(storage.getScenarioDraft());
  const [scenario, setScenario] = useState<Partial<Scenario> | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    storage.setScenarioDraft(raw);
    const result = parseScenario(raw);
    setScenario(result.scenario);
    setWarnings(result.warnings);
    const validation = validateScenario(result.scenario || {}, playerCount);
    setErrors([...result.errors, ...validation.errors]);
    setWarnings([...result.warnings, ...validation.warnings]);
  };

  const handleDemo = () => {
    const json = scenarioToJson(demoScenario);
    setRaw(json);
    setScenario(demoScenario);
    const validation = validateScenario(demoScenario, playerCount);
    setErrors(validation.errors);
    setWarnings(validation.warnings);
  };

  const handleImport = async () => {
    if (!scenario?.disaster || !scenario?.players?.length) return;
    setLoading(true);
    try {
      const full = resolvePlayerTargets(scenario as Scenario);
      await importScenario(roomCode, full);
      storage.clearScenarioDraft();
      onImported?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📥 Импорт сценария</CardTitle>
        <p className="text-sm text-stone-400">
          Вставьте JSON или текст от нейросети
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          className="min-h-[200px] font-mono text-sm"
          placeholder='{"disaster": {...}, "bunker": {...}, "players": [...]}'
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleParse}>Распарсить</Button>
          <Button variant="secondary" onClick={handleDemo}>
            Демо-сценарий
          </Button>
        </div>

        {warnings.length > 0 && (
          <div className="rounded-lg border border-amber-800 bg-amber-950/30 p-3 text-sm text-amber-300">
            <p className="font-medium">Предупреждения:</p>
            <ul className="list-inside list-disc">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {errors.length > 0 && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-300">
            <p className="font-medium">Ошибки:</p>
            <ul className="list-inside list-disc">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {scenario && (
          <div className="rounded-lg border border-stone-700 p-3 text-sm">
            <p>Катастрофа: {scenario.disaster?.title || "—"}</p>
            <p>Игроков: {scenario.players?.length || 0}</p>
            <p>Событий: {scenario.roundEvents?.length || 0}</p>
          </div>
        )}

        <Button
          className="w-full"
          disabled={loading || errors.length > 0 || !scenario}
          onClick={handleImport}
        >
          {loading ? "Импорт..." : "Подтвердить импорт"}
        </Button>
      </CardContent>
    </Card>
  );
}
