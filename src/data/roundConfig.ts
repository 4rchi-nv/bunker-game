import type { CharacteristicType } from "@/types/game";

export const DEFAULT_ROUND_REVEALS: Record<number, CharacteristicType[]> = {
  1: ["profession", "workExperience"],
  2: ["bio"],
  3: ["health"],
  4: ["hobbyOrSkill"],
  5: ["baggage"],
  6: ["facts"],
  7: ["phobia"],
};

export const CHARACTERISTIC_LABELS: Record<CharacteristicType, string> = {
  profession: "Профессия",
  workExperience: "Стаж",
  bio: "Био-данные",
  health: "Здоровье",
  hobbyOrSkill: "Хобби / навык",
  baggage: "Багаж",
  facts: "Факты",
  phobia: "Фобия",
  friendCard: "Карта друга",
  enemyCard: "Карта врага",
  actionCard: "Action-карта",
};

export function getRevealForRound(round: number): CharacteristicType[] {
  return DEFAULT_ROUND_REVEALS[round] || ["phobia"];
}
