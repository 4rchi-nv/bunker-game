"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/types/game";
import { CHARACTERISTIC_LABELS } from "@/data/roundConfig";

function Field({
  label,
  value,
  hidden,
}: {
  label: string;
  value: string | null | undefined;
  hidden?: boolean;
}) {
  return (
    <div className="rounded-lg border border-stone-700/50 bg-stone-950/50 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-stone-500">
          {label}
        </span>
        <Badge variant={hidden ? "hidden" : "open"}>
          {hidden ? "скрыто" : "открыто"}
        </Badge>
      </div>
      <p className="text-sm text-stone-200">
        {hidden ? "••••••••" : value || "—"}
      </p>
    </div>
  );
}

export function PlayerCardView({
  player,
  isOwn,
  hideSecrets,
}: {
  player: Player;
  isOwn: boolean;
  hideSecrets?: boolean;
}) {
  const card = player.card;
  const r = player.revealed;

  if (!card) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-stone-500">
          Карта ещё не назначена
        </CardContent>
      </Card>
    );
  }

  const show = (revealed: boolean | undefined, value: string) => {
    if (isOwn) return { hidden: false, value };
    return { hidden: !revealed && !!hideSecrets, value };
  };

  const bioText = card.bio
    ? `${card.bio.gender}, ${card.bio.age} лет, ${card.bio.orientation}, фертильность: ${card.bio.fertility}`
    : "";

  return (
    <Card className="border-amber-800/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{player.name}</CardTitle>
          {player.isEliminated && <Badge variant="eliminated">изгнан</Badge>}
        </div>
        {card.profession && (
          <p className="text-sm text-amber-500/80">{card.profession}</p>
        )}
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Профессия" {...show(r.profession, card.profession)} />
        <Field label="Стаж" {...show(r.workExperience, card.workExperience)} />
        <Field label="Био" {...show(r.bio, bioText)} />
        <Field label="Здоровье" {...show(r.health, card.health)} />
        <Field label="Фобия" {...show(r.phobia, card.phobia)} />
        <Field label="Хобби / навык" {...show(r.hobbyOrSkill, card.hobbyOrSkill)} />
        <Field label="Факт №1" {...show(r.fact1, card.fact1)} />
        {card.fact2 && (
          <Field label="Факт №2" {...show(r.fact2, card.fact2)} />
        )}
        <Field label="Багаж" {...show(r.baggage, card.baggage)} />
        {(r.friendCard || isOwn) && card.friendCard?.targetName && (
          <Field
            label="Карта друга"
            {...show(r.friendCard, `${card.friendCard.targetName}: ${card.friendCard.description}`)}
          />
        )}
        {(r.enemyCard || isOwn) && card.enemyCard?.targetName && (
          <Field
            label="Карта врага"
            {...show(r.enemyCard, `${card.enemyCard.targetName}: ${card.enemyCard.description}`)}
          />
        )}
        {isOwn && (
          <div className="rounded-lg border border-purple-800/50 bg-purple-950/20 p-3 sm:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs uppercase text-purple-400">
                Action-карта
              </span>
              <Badge variant={card.actionCard.used ? "used" : "hidden"}>
                {card.actionCard.used ? "использовано" : "секрет"}
              </Badge>
            </div>
            <p className="font-medium text-purple-200">{card.actionCard.title}</p>
            <p className="mt-1 text-sm text-stone-400">{card.actionCard.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RevealHint({ chars }: { chars: string | string[] }) {
  const list = Array.isArray(chars) ? chars : [chars];
  return (
    <p className="text-sm text-amber-400/90">
      Раскрыть в этом раунде:{" "}
      {list.map((c) => CHARACTERISTIC_LABELS[c as keyof typeof CHARACTERISTIC_LABELS] || c).join(", ")}
    </p>
  );
}
