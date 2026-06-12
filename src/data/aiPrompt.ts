export function buildAiPrompt(playerCount: number): string {
  return `Ты — генератор сценариев для настольной дискуссионной игры «Бункер» (выживание после катастрофы).

Создай УНИКАЛЬНЫЙ сценарий на русском языке для партии из ${playerCount} игроков.

Требования:
1. Катастрофа — оригинальная, с названием, описанием, опасностями, условиями снаружи, атмосферными деталями.
2. Бункер — подробное описание: локация, глубина, площадь, вместимость, автономность, запасы, комнаты, системы, плюсы, минусы, скрытые проблемы.
3. Ровно ${playerCount} сбалансированных игроков. У каждого:
   - профессия и стаж;
   - био: пол, возраст, ориентация, фертильность (явно: плоден / бесплоден / низкая / неизвестна / менопауза / беременность);
   - здоровье, фобия, хобби/навык;
   - факт №1 и факт №2 (если уместно);
   - багаж;
   - карта друга ИЛИ карта врага (не оба у одного игрока!);
   - action-карта (title, description, type, powerLevel: low/medium/high).
4. В игре ровно ОДИН игрок с картой друга и ОДИН другой игрок с картой врага.
5. Карта друга: игрок попадает в бункер только вместе с указанным другом.
6. Карта врага: игрок не может быть в бункере с врагом.
7. 1–2 сильные action-карты (high), остальные мягче.
8. События на 7 раундов: каждый раунд — goodEvent и badEvent (title, description, effect).
9. Обязательно включи плохое событие про радиопомехи и галлюцинации в одном из раундов.
10. finalStoryTemplate — короткий шаблон финальной истории.

Верни ТОЛЬКО валидный JSON в такой структуре:

{
  "disaster": {
    "title": "",
    "description": "",
    "dangers": [],
    "outsideConditions": [],
    "atmosphereNotes": []
  },
  "bunker": {
    "location": "",
    "depth": "",
    "area": "",
    "capacity": 8,
    "autonomy": "",
    "supplies": [],
    "rooms": [],
    "systems": [],
    "advantages": [],
    "disadvantages": [],
    "hiddenProblems": []
  },
  "players": [
    {
      "id": "p1",
      "name": "",
      "profession": "",
      "workExperience": "",
      "bio": { "gender": "", "age": 0, "orientation": "", "fertility": "", "rawText": "" },
      "health": "",
      "phobia": "",
      "hobbyOrSkill": "",
      "fact1": "",
      "fact2": "",
      "baggage": "",
      "friendCard": { "targetPlayerId": "p2", "targetName": "", "description": "" },
      "enemyCard": { "targetPlayerId": "", "targetName": "", "description": "" },
      "actionCard": { "title": "", "description": "", "type": "custom", "powerLevel": "medium" }
    }
  ],
  "roundEvents": [
    {
      "round": 1,
      "goodEvent": { "title": "", "description": "", "effect": "" },
      "badEvent": { "title": "", "description": "", "effect": "" }
    }
  ],
  "finalStoryTemplate": ""
}

Не копируй чужие официальные карты и тексты. Все персонажи и события — оригинальные.`;
}
