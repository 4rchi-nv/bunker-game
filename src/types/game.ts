export type GamePhase =
  | "lobby"
  | "setup"
  | "reveal"
  | "discussion"
  | "events"
  | "actions"
  | "voting"
  | "elimination"
  | "final";

export type CharacteristicType =
  | "profession"
  | "workExperience"
  | "bio"
  | "health"
  | "hobbyOrSkill"
  | "baggage"
  | "facts"
  | "phobia"
  | "friendCard"
  | "enemyCard"
  | "actionCard";

export type FertilityType =
  | "плоден"
  | "бесплоден"
  | "низкая"
  | "неизвестна"
  | "менопауза"
  | "беременность";

export type ActionCardType =
  | "council_vote"
  | "force_reveal"
  | "swap"
  | "immunity"
  | "revote"
  | "silence"
  | "exposed_secret"
  | "barter"
  | "free_hands"
  | "lucky_find"
  | "sabotage"
  | "riot"
  | "sacrifice"
  | "custom";

export interface ActionCard {
  title: string;
  description: string;
  type: ActionCardType | string;
  powerLevel: "low" | "medium" | "high";
  used?: boolean;
}

export interface PlayerBio {
  gender: string;
  age: number | string;
  orientation: string;
  fertility: FertilityType | string;
  rawText?: string;
}

export interface PlayerCard {
  id: string;
  name: string;
  profession: string;
  workExperience: string;
  bio: PlayerBio;
  health: string;
  phobia: string;
  hobbyOrSkill: string;
  fact1: string;
  fact2?: string;
  baggage: string;
  friendCard: { targetPlayerId: string; targetName: string; description: string };
  enemyCard: { targetPlayerId: string; targetName: string; description: string };
  actionCard: ActionCard;
}

export interface RevealedCharacteristics {
  profession?: boolean;
  workExperience?: boolean;
  bio?: boolean;
  health?: boolean;
  hobbyOrSkill?: boolean;
  baggage?: boolean;
  fact1?: boolean;
  fact2?: boolean;
  phobia?: boolean;
  friendCard?: boolean;
  enemyCard?: boolean;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isEliminated: boolean;
  card: PlayerCard | null;
  revealed: RevealedCharacteristics;
  joinedAt: number;
}

export interface Disaster {
  title: string;
  description: string;
  dangers: string[];
  outsideConditions: string[];
  atmosphereNotes: string[];
}

export interface BunkerInfo {
  location: string;
  depth: string;
  area: string;
  capacity: number;
  autonomy: string;
  supplies: string[];
  rooms: string[];
  systems: string[];
  advantages: string[];
  disadvantages: string[];
  hiddenProblems: string[];
}

export interface RoundEvent {
  title: string;
  description: string;
  effect: string;
}

export interface RoundEventPair {
  round: number;
  goodEvent: RoundEvent;
  badEvent: RoundEvent;
}

export interface Vote {
  voterId: string;
  targetId: string;
  weight: number;
  timestamp: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  type:
    | "system"
    | "reveal"
    | "event"
    | "action"
    | "vote"
    | "elimination"
    | "phase"
    | "discussion";
  message: string;
  playerId?: string;
  round?: number;
}

export interface RoomSettings {
  maxPlayers: number;
  bunkerSlots: number;
  hostPlays: boolean;
  discussionMinutes: number;
  eliminationsPerRound: number;
  showFinalStory: boolean;
  enableRoundEvents: boolean;
  allowSelfVote: boolean;
  hideFriendEnemyUntilFinal: boolean;
}

export interface GameSession {
  currentRound: number;
  phase: GamePhase;
  currentReveal: CharacteristicType | CharacteristicType[];
  discussionEndsAt: number | null;
  activeGoodEvent: RoundEvent | null;
  activeBadEvent: RoundEvent | null;
  votes: Vote[];
  voteResults: Record<string, number>;
  pendingEliminations: string[];
  gameLog: GameLogEntry[];
  finalStory: string;
  customFinalStory: string;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  settings: RoomSettings;
  players: Record<string, Player>;
  scenario?: import("@/types/scenario").Scenario | null;
  scenarioImported: boolean;
  game: GameSession;
  status: "waiting" | "setup" | "playing" | "finished";
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 2,
  bunkerSlots: 1,
  hostPlays: true,
  discussionMinutes: 5,
  eliminationsPerRound: 1,
  showFinalStory: true,
  enableRoundEvents: true,
  allowSelfVote: false,
  hideFriendEnemyUntilFinal: true,
};

export function getDefaultBunkerSlots(playerCount: number): number {
  const map: Record<number, number> = {
    2: 1, 3: 1, 4: 2,
    5: 2, 6: 3, 7: 3, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 6, 13: 6, 14: 7, 15: 7, 16: 8,
  };
  if (map[playerCount]) return map[playerCount];
  return Math.min(
    playerCount - 1,
    Math.max(1, Math.floor(playerCount / 2))
  );
}

export function createEmptyGameSession(): GameSession {
  return {
    currentRound: 0,
    phase: "lobby",
    currentReveal: "profession",
    discussionEndsAt: null,
    activeGoodEvent: null,
    activeBadEvent: null,
    votes: [],
    voteResults: {},
    pendingEliminations: [],
    gameLog: [],
    finalStory: "",
    customFinalStory: "",
    startedAt: null,
    finishedAt: null,
  };
}
