import type { Scenario } from "@/types/scenario";
import type { Room, RoomSettings } from "@/types/game";
import { FERTILITY_VALUES } from "@/types/scenario";
import { MIN_PLAYERS } from "@/lib/game/limits";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateRoomSettings(settings: RoomSettings): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (settings.maxPlayers < MIN_PLAYERS) {
    errors.push(`Минимум ${MIN_PLAYERS} игрока в комнате`);
  } else if (settings.maxPlayers < 5) {
    warnings.push("Режим тестирования: рекомендуется 5+ игроков");
  }
  if (settings.bunkerSlots >= settings.maxPlayers) {
    errors.push("Мест в бункере должно быть меньше, чем игроков");
  }
  if (settings.bunkerSlots < 1) {
    errors.push("В бункере должно быть хотя бы одно место");
  }
  if (settings.eliminationsPerRound < 1) {
    errors.push("Минимум 1 исключение за раунд");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateScenario(
  scenario: Partial<Scenario>,
  playerCount: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scenario.disaster?.title) errors.push("Не указана катастрофа (название)");
  if (!scenario.disaster?.description) warnings.push("Нет описания катастрофы");
  if (!scenario.bunker?.location && !scenario.bunker?.area) {
    errors.push("Не указан бункер");
  }

  const players = scenario.players || [];
  if (players.length < playerCount) {
    errors.push(`Недостаточно игроков в сценарии: ${players.length} из ${playerCount}`);
  }

  const requiredFields = [
    "profession",
    "workExperience",
    "health",
    "phobia",
    "hobbyOrSkill",
    "fact1",
    "baggage",
  ] as const;

  players.forEach((p, i) => {
    for (const field of requiredFields) {
      if (!p[field]?.toString().trim()) {
        errors.push(`Игрок ${i + 1} (${p.name || "без имени"}): нет поля «${field}»`);
      }
    }
    if (!p.bio?.gender) errors.push(`Игрок ${i + 1}: не указан пол`);
    if (!p.bio?.age) errors.push(`Игрок ${i + 1}: не указан возраст`);
    if (!p.bio?.orientation) errors.push(`Игрок ${i + 1}: не указана ориентация`);
    if (!p.bio?.fertility) {
      errors.push(`Игрок ${i + 1}: не указана фертильность`);
    } else {
      const f = p.bio.fertility.toLowerCase();
      const ok = FERTILITY_VALUES.some((v) => f.includes(v));
      if (!ok) warnings.push(`Игрок ${i + 1}: нестандартная фертильность «${p.bio.fertility}»`);
    }
    if (!p.actionCard?.title) errors.push(`Игрок ${i + 1}: нет action-карты`);
    if (p.friendCard?.targetName && p.enemyCard?.targetName) {
      errors.push(`Игрок ${i + 1}: нельзя иметь и друга, и врага одновременно`);
    }
  });

  const withFriend = players.filter((p) => p.friendCard?.targetName || p.friendCard?.targetPlayerId);
  const withEnemy = players.filter((p) => p.enemyCard?.targetName || p.enemyCard?.targetPlayerId);

  if (withFriend.length === 0) warnings.push("Нет ни одной карты друга");
  if (withEnemy.length === 0) warnings.push("Нет ни одной карты врага");

  players.forEach((p) => {
    if (p.friendCard?.targetName) {
      const exists = players.some(
        (other) =>
          other.id === p.friendCard.targetPlayerId ||
          other.name === p.friendCard.targetName
      );
      if (!exists) warnings.push(`Карта друга у ${p.name}: цель не найдена`);
    }
    if (p.enemyCard?.targetName) {
      const exists = players.some(
        (other) =>
          other.id === p.enemyCard.targetPlayerId ||
          other.name === p.enemyCard.targetName
      );
      if (!exists) warnings.push(`Карта врага у ${p.name}: цель не найдена`);
    }
  });

  const events = scenario.roundEvents || [];
  if (events.length < 3) {
    warnings.push("Мало событий раундов (рекомендуется минимум 3)");
  }

  const highPower = players.filter((p) => p.actionCard?.powerLevel === "high");
  if (highPower.length > 2) {
    warnings.push("Слишком много сильных action-карт (>2)");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function canStartGame(room: Room): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const players = Object.values(room.players).filter((p) => !p.isEliminated);
  const activeCount = players.length;

  // if (activeCount < MIN_PLAYERS) {
  //   errors.push(`Недостаточно игроков: ${activeCount}. Минимум ${MIN_PLAYERS}`);
  // } else if (activeCount <= room.settings.bunkerSlots) {
  //   errors.push(
  //     `Игроков (${activeCount}) должно быть больше, чем мест в бункере (${room.settings.bunkerSlots})`
  //   );
  // }

  if (!room.scenarioImported) {
    errors.push("Сценарий не импортирован");
  }

  const notReady = players.filter((p) => !p.isReady && !p.isHost);
  if (notReady.length > 0) warnings.push(`${notReady.length} игрок(ов) не готовы`);

  return { valid: errors.length === 0, errors, warnings };
}

export function resolvePlayerTargets(scenario: Scenario): Scenario {
  const players = scenario.players.map((p) => ({ ...p }));
  const nameToId = new Map(players.map((p) => [p.name.toLowerCase(), p.id]));

  for (const p of players) {
    if (p.friendCard.targetName && !p.friendCard.targetPlayerId) {
      p.friendCard.targetPlayerId =
        nameToId.get(p.friendCard.targetName.toLowerCase()) || "";
    }
    if (p.enemyCard.targetName && !p.enemyCard.targetPlayerId) {
      p.enemyCard.targetPlayerId =
        nameToId.get(p.enemyCard.targetName.toLowerCase()) || "";
    }
  }
  return { ...scenario, players };
}
