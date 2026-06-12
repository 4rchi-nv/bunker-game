import type { ActionCard } from "@/types/game";

export const ACTION_CARD_EXAMPLES: ActionCard[] = [
  {
    title: "Голос совета",
    description: "Ваш голос на этом раунде считается за два.",
    type: "council_vote",
    powerLevel: "high",
  },
  {
    title: "Раскрытие",
    description: "Заставьте выбранного игрока открыть одну скрытую характеристику.",
    type: "force_reveal",
    powerLevel: "medium",
  },
  {
    title: "Подмена",
    description: "Обменяйтесь одной открытой характеристикой с другим игроком.",
    type: "swap",
    powerLevel: "medium",
  },
  {
    title: "Иммунитет",
    description: "Вас нельзя изгнать в этом раунде.",
    type: "immunity",
    powerLevel: "high",
  },
  {
    title: "Перевыборы",
    description: "Отмените результаты голосования и проведите переголосование.",
    type: "revote",
    powerLevel: "medium",
  },
  {
    title: "Запрет",
    description: "Один игрок не может голосовать в этом раунде.",
    type: "silence",
    powerLevel: "low",
  },
  {
    title: "Тайна вскрыта",
    description: "Откройте карту другого игрока, но ваша скрытая карта тоже раскрывается.",
    type: "exposed_secret",
    powerLevel: "medium",
  },
  {
    title: "Бартер",
    description: "Предложите обмен информацией или картой с другим игроком.",
    type: "barter",
    powerLevel: "low",
  },
  {
    title: "Свободные руки",
    description: "В этом раунде вам не нужно раскрывать характеристику.",
    type: "free_hands",
    powerLevel: "low",
  },
  {
    title: "Внезапная находка",
    description: "Найден небольшой запас ресурсов для бункера.",
    type: "lucky_find",
    powerLevel: "low",
  },
  {
    title: "Саботаж",
    description: "Тайно испортите один ресурс бункера.",
    type: "sabotage",
    powerLevel: "medium",
  },
  {
    title: "Бунт",
    description: "Отложите голосование, но бункер теряет ресурсы.",
    type: "riot",
    powerLevel: "high",
  },
  {
    title: "Жертва",
    description: "Добровольно уйдите и повлияйте на исход голосования.",
    type: "sacrifice",
    powerLevel: "high",
  },
];
