import type { Room, Player, RoundEvent } from "@/types/game";
import type { Scenario } from "@/types/scenario";

interface Conflict {
  type: string;
  message: string;
  severity: "high" | "medium" | "low";
}

export function detectConflicts(finalists: Player[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const finalistIds = new Set(finalists.map((p) => p.id));
  const finalistNames = new Set(finalists.map((p) => p.name.toLowerCase()));

  for (const p of finalists) {
    const card = p.card;
    if (!card) continue;

    if (card.friendCard?.targetPlayerId || card.friendCard?.targetName) {
      const friendIn =
        finalistIds.has(card.friendCard.targetPlayerId) ||
        finalistNames.has(card.friendCard.targetName?.toLowerCase() || "");
      if (!friendIn && card.friendCard.targetName) {
        conflicts.push({
          type: "friend",
          message: `${p.name}: друг «${card.friendCard.targetName}» не прошёл в бункер`,
          severity: "high",
        });
      }
    }

    if (card.enemyCard?.targetPlayerId || card.enemyCard?.targetName) {
      const enemyIn =
        finalistIds.has(card.enemyCard.targetPlayerId) ||
        finalistNames.has(card.enemyCard.targetName?.toLowerCase() || "");
      if (enemyIn && card.enemyCard.targetName) {
        conflicts.push({
          type: "enemy",
          message: `${p.name}: враг «${card.enemyCard.targetName}» тоже в бункере`,
          severity: "high",
        });
      }
    }

    const fertility = card.bio?.fertility?.toLowerCase() || "";
    if (fertility.includes("бесплод")) {
      conflicts.push({
        type: "fertility",
        message: `${p.name}: бесплодие — продолжение рода затруднено`,
        severity: "medium",
      });
    }
    if (fertility.includes("беремен")) {
      conflicts.push({
        type: "fertility",
        message: `${p.name}: беременность — нужен особый уход и ресурсы`,
        severity: "medium",
      });
    }

    if (card.health?.toLowerCase().match(/диабет|рак|сердц|инфекц|зараж/)) {
      conflicts.push({
        type: "health",
        message: `${p.name}: критическое здоровье — ${card.health}`,
        severity: "high",
      });
    }
  }

  const phobias = finalists.map((p) => p.card?.phobia).filter(Boolean);
  if (phobias.some((p) => p?.includes("замкнут") || p?.includes("клаустро"))) {
    conflicts.push({
      type: "phobia",
      message: "Клаустрофобия в закрытом бункере — риск срывов",
      severity: "medium",
    });
  }

  return conflicts;
}

function calcSurvivalChance(
  finalists: Player[],
  conflicts: Conflict[],
  goodEvents: RoundEvent[],
  badEvents: RoundEvent[]
): number {
  let base = 55;
  base += finalists.length * 3;
  base += goodEvents.length * 4;
  base -= badEvents.length * 5;
  base -= conflicts.filter((c) => c.severity === "high").length * 8;
  base -= conflicts.filter((c) => c.severity === "medium").length * 4;
  return Math.max(5, Math.min(95, base));
}

export function generateFinalStory(
  room: Room,
  scenario: Scenario
): string {
  const allPlayers = Object.values(room.players);
  const finalists = allPlayers.filter((p) => !p.isEliminated && p.card);
  const eliminated = allPlayers.filter((p) => p.isEliminated);

  const log = room.game.gameLog || [];
  const goodEvents = log
    .filter((e) => e.type === "event" && e.message.includes("✅"))
    .map((e) => ({ title: e.message, description: "", effect: "" }));
  const badEvents = log
    .filter((e) => e.type === "event" && e.message.includes("⚠️"))
    .map((e) => ({ title: e.message, description: "", effect: "" }));

  const conflicts = detectConflicts(finalists);
  const survival = calcSurvivalChance(finalists, conflicts, goodEvents, badEvents);

  const disaster = scenario.disaster.title;
  const bunker = scenario.bunker.location;

  const finalistList = finalists.map((p) => p.name).join(", ");
  const eliminatedList = eliminated.map((p) => p.name).join(", ") || "никто";

  const leader = finalists.find((p) =>
    p.card?.profession?.match(/инженер|военн|охран|лидер/i)
  )?.name || finalists[0]?.name || "группа";

  const weakLink = finalists.find((p) =>
    p.card?.health?.match(/критич|тяжёл|хронич/i) ||
    p.card?.bio?.fertility === "бесплоден"
  )?.name;

  let story = `## Финал: ${disaster}\n\n`;
  story += `Дверь бункера захлопнулась. За ней — ${disaster.toLowerCase()}. `;
  story += `Под ${bunker} остались **${finalistList}** — ${finalists.length} из ${allPlayers.length} претендентов.\n\n`;
  story += `### Изгнанные\n${eliminatedList}\n\n`;
  story += `### События пути\n`;
  story += `**Хорошие:** ${goodEvents.length ? goodEvents.map((e) => e.title).join("; ") : "мало удачи"}\n`;
  story += `**Плохие:** ${badEvents.length ? badEvents.map((e) => e.title).join("; ") : "обошлось"}\n\n`;

  if (conflicts.length) {
    story += `### Конфликты и риски\n`;
    conflicts.forEach((c) => {
      story += `- ${c.message}\n`;
    });
    story += `\n`;
  }

  story += `### Через год\n`;
  story += `Лидером де-факто стал ${leader}. `;
  if (weakLink) story += `Слабым звеном считают ${weakLink}. `;
  story += `Ресурсы: ${scenario.bunker.supplies.slice(0, 2).join(", ")}. `;
  story += `Генератор ${badEvents.some((e) => e.title.includes("генератор")) ? "требует постоянного ремонта" : "работает стабильно"}. `;
  story += `Вода ${badEvents.some((e) => e.title.includes("вод")) ? "под угрозой" : "фильтруется"}.\n\n`;

  const fertile = finalists.filter((p) =>
    p.card?.bio?.fertility?.toString().includes("плод") ||
    p.card?.bio?.fertility === "беременность"
  );
  story += `### Продолжение рода\n`;
  story += fertile.length >= 2
    ? `Шанс сохранить популяцию есть (${fertile.map((p) => p.name).join(", ")}).`
    : `Продолжение рода под большим вопросом.`;
  story += `\n\n`;
  story += `### Итоговый шанс выживания: **${survival}%**\n`;

  if (scenario.finalStoryTemplate) {
    story += `\n---\n${scenario.finalStoryTemplate}\n`;
  }

  return story;
}
