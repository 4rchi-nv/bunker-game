import type { GamePhase } from "@/types/game";

export const PHASE_LABELS: Record<GamePhase, string> = {
  lobby: "Лобби",
  setup: "Настройка",
  reveal: "Раскрытие",
  discussion: "Обсуждение",
  events: "События",
  actions: "Action-карты",
  voting: "Голосование",
  elimination: "Исключение",
  final: "Финал",
};
