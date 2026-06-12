import type {
  BunkerInfo,
  Disaster,
  PlayerCard,
  RoundEventPair,
} from "./game";

export interface Scenario {
  disaster: Disaster;
  bunker: BunkerInfo;
  players: PlayerCard[];
  roundEvents: RoundEventPair[];
  finalStoryTemplate?: string;
}

export interface ParseResult {
  success: boolean;
  scenario: Partial<Scenario> | null;
  warnings: string[];
  errors: string[];
  rawFormat: "json" | "text" | "unknown";
}

export const FERTILITY_VALUES = [
  "плоден",
  "бесплоден",
  "низкая",
  "неизвестна",
  "менопауза",
  "беременность",
] as const;
