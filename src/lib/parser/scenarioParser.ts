import type { Scenario } from "@/types/scenario";
import type { ParseResult } from "@/types/scenario";
import type { PlayerCard, RoundEventPair } from "@/types/game";

function emptyScenario(): Partial<Scenario> {
  return {
    disaster: {
      title: "",
      description: "",
      dangers: [],
      outsideConditions: [],
      atmosphereNotes: [],
    },
    bunker: {
      location: "",
      depth: "",
      area: "",
      capacity: 8,
      autonomy: "",
      supplies: [],
      rooms: [],
      systems: [],
      advantages: [],
      disadvantages: [],
      hiddenProblems: [],
    },
    players: [],
    roundEvents: [],
    finalStoryTemplate: "",
  };
}

function parseList(text: string): string[] {
  return text
    .split(/\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function extractField(block: string, keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(`(?:^|\\n)\\s*${key}\\s*[:：]\\s*(.+?)(?=\\n\\s*\\w|$)`, "is");
    const m = block.match(re);
    if (m) return m[1].trim();
  }
  return "";
}

function parsePlayerBlock(block: string, index: number): PlayerCard {
  const id = `p${index}`;
  const name = extractField(block, ["имя", "name", "Имя", "Name"]) || `Игрок ${index}`;
  const fertility =
    extractField(block, ["фертильность", "fertility", "Фертильность"]) || "неизвестна";

  return {
    id,
    name,
    profession: extractField(block, ["профессия", "profession", "Профессия"]) || "",
    workExperience: extractField(block, ["стаж", "workExperience", "опыт", "Стаж"]) || "",
    bio: {
      gender: extractField(block, ["пол", "gender", "Пол"]) || "",
      age: extractField(block, ["возраст", "age", "Возраст"]) || "",
      orientation: extractField(block, ["ориентация", "orientation", "Ориентация"]) || "",
      fertility,
      rawText: extractField(block, ["био", "bio", "Био"]) || "",
    },
    health: extractField(block, ["здоровье", "health", "Здоровье"]) || "",
    phobia: extractField(block, ["фобия", "phobia", "Фобия"]) || "",
    hobbyOrSkill: extractField(block, ["хобби", "навык", "hobbyOrSkill", "Хобби"]) || "",
    fact1: extractField(block, ["факт 1", "fact1", "Факт 1", "факт1"]) || "",
    fact2: extractField(block, ["факт 2", "fact2", "Факт 2", "факт2"]) || "",
    baggage: extractField(block, ["багаж", "baggage", "Багаж"]) || "",
    friendCard: {
      targetPlayerId: "",
      targetName: extractField(block, ["друг", "friend", "карта друга", "Карта друга"]) || "",
      description: extractField(block, ["описание друга", "friend description"]) || "",
    },
    enemyCard: {
      targetPlayerId: "",
      targetName: extractField(block, ["враг", "enemy", "карта врага", "Карта врага"]) || "",
      description: extractField(block, ["описание врага", "enemy description"]) || "",
    },
    actionCard: {
      title: extractField(block, ["action", "action-карта", "Action", "особое условие"]) || "",
      description: extractField(block, ["описание action", "action description"]) || "",
      type: "custom",
      powerLevel: "medium",
    },
  };
}

function parseTextScenario(text: string): ParseResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const scenario = emptyScenario();

  const disasterMatch = text.match(
    /(?:^|\n)#?\s*Катастрофа([\s\S]*?)(?=\n#?\s*Бункер|\n#?\s*Игрок|\n#?\s*События|$)/i
  );
  if (disasterMatch) {
    const block = disasterMatch[1];
    scenario.disaster!.title = extractField(block, ["название", "title", "Название"]) || extractField(block, ["title"]);
    if (!scenario.disaster!.title) {
      const firstLine = block.trim().split("\n")[0]?.trim();
      scenario.disaster!.title = firstLine || "Без названия";
    }
    scenario.disaster!.description =
      extractField(block, ["описание", "description", "Описание"]) ||
      block.trim().slice(0, 500);
    const dangersBlock = block.match(/опасност[ьи][:\s]*([\s\S]*?)(?=\n\s*\w|$)/i);
    if (dangersBlock) scenario.disaster!.dangers = parseList(dangersBlock[1]);
  } else {
    warnings.push("Секция «Катастрофа» не найдена");
  }

  const bunkerMatch = text.match(
    /(?:^|\n)#?\s*Бункер([\s\S]*?)(?=\n#?\s*Игрок|\n#?\s*События|\n#?\s*Финал|$)/i
  );
  if (bunkerMatch) {
    const block = bunkerMatch[1];
    scenario.bunker!.location = extractField(block, ["расположение", "location", "Локация"]) || "";
    scenario.bunker!.depth = extractField(block, ["глубина", "depth"]) || "";
    scenario.bunker!.area = extractField(block, ["площадь", "area"]) || "";
    scenario.bunker!.autonomy = extractField(block, ["автономность", "autonomy"]) || "";
    const cap = extractField(block, ["вместимость", "capacity"]);
    if (cap) scenario.bunker!.capacity = parseInt(cap, 10) || 8;
  } else {
    warnings.push("Секция «Бункер» не найдена");
  }

  const playerRegex = /(?:^|\n)#?\s*Игрок\s*(\d+)([\s\S]*?)(?=\n#?\s*Игрок\s*\d+|\n#?\s*События|\n#?\s*Финал|$)/gi;
  let playerMatch;
  let playerIndex = 0;
  while ((playerMatch = playerRegex.exec(text)) !== null) {
    playerIndex++;
    const playerBlock = playerMatch[2];
    scenario.players!.push(parsePlayerBlock(playerBlock, playerIndex));
  }
  if (playerIndex === 0) warnings.push("Игроки не найдены");

  const eventsMatch = text.match(/(?:^|\n)#?\s*События([\s\S]*?)(?=\n#?\s*Финал|$)/i);
  if (eventsMatch) {
    const roundRegex = /раунд\s*(\d+)([\s\S]*?)(?=раунд\s*\d+|$)/gi;
    let rm;
    while ((rm = roundRegex.exec(eventsMatch[1])) !== null) {
      const round = parseInt(rm[1], 10);
      const block = rm[2];
      const goodTitle = extractField(block, ["хорошее", "good", "Хорошее событие"]) || "";
      const badTitle = extractField(block, ["плохое", "bad", "Плохое событие"]) || "";
      scenario.roundEvents!.push({
        round,
        goodEvent: {
          title: goodTitle || `Хорошее событие раунда ${round}`,
          description: extractField(block, ["описание хорошего", "good description"]) || goodTitle,
          effect: extractField(block, ["эффект хорошего", "good effect"]) || "",
        },
        badEvent: {
          title: badTitle || `Плохое событие раунда ${round}`,
          description: extractField(block, ["описание плохого", "bad description"]) || badTitle,
          effect: extractField(block, ["эффект плохого", "bad effect"]) || "",
        },
      });
    }
  }

  const finalMatch = text.match(/(?:^|\n)#?\s*Финал([\s\S]*?)$/i);
  if (finalMatch) {
    scenario.finalStoryTemplate = finalMatch[1].trim();
  }

  return {
    success: errors.length === 0,
    scenario,
    warnings,
    errors,
    rawFormat: "text",
  };
}

function normalizeJsonScenario(data: unknown): Partial<Scenario> {
  if (!data || typeof data !== "object") return emptyScenario();
  const d = data as Record<string, unknown>;
  return {
    disaster: (d.disaster as Scenario["disaster"]) || emptyScenario().disaster,
    bunker: (d.bunker as Scenario["bunker"]) || emptyScenario().bunker,
    players: (d.players as PlayerCard[]) || [],
    roundEvents: (d.roundEvents as RoundEventPair[]) || [],
    finalStoryTemplate: (d.finalStoryTemplate as string) || "",
  };
}

export function parseScenario(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      success: false,
      scenario: null,
      warnings: [],
      errors: ["Пустой ввод"],
      rawFormat: "unknown",
    };
  }

  try {
    const json = JSON.parse(trimmed) as unknown;
    const scenario = normalizeJsonScenario(json);
    return {
      success: true,
      scenario,
      warnings: [],
      errors: [],
      rawFormat: "json",
    };
  } catch {
    return parseTextScenario(trimmed);
  }
}

export function scenarioToJson(scenario: Scenario): string {
  return JSON.stringify(scenario, null, 2);
}
