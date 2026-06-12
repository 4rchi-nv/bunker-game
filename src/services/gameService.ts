import { updateDoc, getDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { generateId } from "@/lib/utils";
import type {
  Room,
  GamePhase,
  CharacteristicType,
  Player,
  GameLogEntry,
  Vote,
} from "@/types/game";
import type { Scenario } from "@/types/scenario";
import { getRevealForRound } from "@/data/roundConfig";
import { generateFinalStory } from "@/lib/game/finalStory";
import { resolvePlayerTargets } from "@/lib/game/validation";

const COLLECTION = "rooms";

function roomRef(code: string) {
  return doc(getFirebaseDb(), COLLECTION, code.toUpperCase());
}

async function getRoomData(code: string): Promise<Room> {
  const snap = await getDoc(roomRef(code));
  if (!snap.exists()) throw new Error("Комната не найдена");
  return snap.data() as Room;
}

function countActive(room: Room): number {
  const players = Object.values(room.players).filter((p) => !p.isEliminated);
  if (!room.settings.hostPlays) {
    return players.filter((p) => !p.isHost || p.id !== room.hostId).length;
  }
  return players.length;
}

export async function startGame(code: string): Promise<void> {
  const room = await getRoomData(code);
  const scenario = (room as Room & { scenario: Scenario }).scenario;
  if (!scenario) throw new Error("Нет сценария");

  const resolved = resolvePlayerTargets(scenario);
  const playerList = Object.values(room.players).filter((p) => !p.isEliminated);
  const cardPlayers = room.settings.hostPlays
    ? playerList
    : playerList.filter((p) => p.id !== room.hostId);

  const updates: Record<string, unknown> = {
    status: "playing",
    updatedAt: Date.now(),
    "game.phase": "reveal" as GamePhase,
    "game.currentRound": 1,
    "game.startedAt": Date.now(),
    "game.currentReveal": getRevealForRound(1),
    "game.gameLog": [
      {
        id: generateId(),
        timestamp: Date.now(),
        type: "system",
        message: "Игра началась!",
        round: 1,
      },
    ],
  };

  cardPlayers.forEach((player, index) => {
    const card = resolved.players[index];
    if (card) {
      updates[`players.${player.id}.card`] = {
        ...card,
        name: player.name,
        actionCard: { ...card.actionCard, used: false },
      };
      updates[`players.${player.id}.revealed`] = {};
    }
  });

  await updateDoc(roomRef(code), updates);
}

export async function setPhase(code: string, phase: GamePhase): Promise<void> {
  const room = await getRoomData(code);
  const log: GameLogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    type: "phase",
    message: `Фаза: ${phase}`,
    round: room.game.currentRound,
  };
  await updateDoc(roomRef(code), {
    "game.phase": phase,
    "game.gameLog": [...(room.game.gameLog || []), log],
    updatedAt: Date.now(),
  });
}

export async function setRevealCharacteristic(
  code: string,
  chars: CharacteristicType | CharacteristicType[]
): Promise<void> {
  await updateDoc(roomRef(code), {
    "game.currentReveal": chars,
    "game.phase": "reveal",
    updatedAt: Date.now(),
  });
}

export async function revealPlayerCharacteristic(
  code: string,
  playerId: string,
  char: CharacteristicType
): Promise<void> {
  const room = await getRoomData(code);
  const player = room.players[playerId];
  if (!player) return;

  const revealed = { ...player.revealed };
  const map: Record<string, keyof typeof revealed> = {
    profession: "profession",
    workExperience: "workExperience",
    bio: "bio",
    health: "health",
    hobbyOrSkill: "hobbyOrSkill",
    baggage: "baggage",
    facts: "fact1",
    phobia: "phobia",
    friendCard: "friendCard",
    enemyCard: "enemyCard",
  };

  if (char === "facts") {
    revealed.fact1 = true;
    if (player.card?.fact2) revealed.fact2 = true;
  } else {
    const key = map[char];
    if (key) revealed[key] = true;
  }

  const log: GameLogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    type: "reveal",
    message: `${player.name} раскрыл: ${char}`,
    playerId,
    round: room.game.currentRound,
  };

  await updateDoc(roomRef(code), {
    [`players.${playerId}.revealed`]: revealed,
    "game.gameLog": [...(room.game.gameLog || []), log],
    updatedAt: Date.now(),
  });
}

export async function startDiscussion(
  code: string,
  minutes?: number
): Promise<void> {
  const room = await getRoomData(code);
  const mins = minutes ?? room.settings.discussionMinutes;
  const endsAt = Date.now() + mins * 60 * 1000;
  await updateDoc(roomRef(code), {
    "game.phase": "discussion",
    "game.discussionEndsAt": endsAt,
    updatedAt: Date.now(),
  });
}

export async function showRoundEvents(code: string): Promise<void> {
  const room = await getRoomData(code);
  const scenario = (room as Room & { scenario: Scenario }).scenario;
  if (!scenario || !room.settings.enableRoundEvents) {
    await setPhase(code, "actions");
    return;
  }

  const round = room.game.currentRound;
  const pair = scenario.roundEvents.find((e) => e.round === round);
  const logs = [...(room.game.gameLog || [])];

  if (pair) {
    logs.push({
      id: generateId(),
      timestamp: Date.now(),
      type: "event",
      message: `✅ ${pair.goodEvent.title}: ${pair.goodEvent.effect}`,
      round,
    });
    logs.push({
      id: generateId(),
      timestamp: Date.now(),
      type: "event",
      message: `⚠️ ${pair.badEvent.title}: ${pair.badEvent.effect}`,
      round,
    });
  }

  await updateDoc(roomRef(code), {
    "game.phase": "events",
    "game.activeGoodEvent": pair?.goodEvent || null,
    "game.activeBadEvent": pair?.badEvent || null,
    "game.gameLog": logs,
    updatedAt: Date.now(),
  });
}

export async function submitActionCard(
  code: string,
  playerId: string,
  note: string
): Promise<void> {
  const room = await getRoomData(code);
  const player = room.players[playerId];
  if (!player?.card?.actionCard) return;

  const log: GameLogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    type: "action",
    message: `🃏 ${player.name} использовал «${player.card.actionCard.title}»: ${note}`,
    playerId,
    round: room.game.currentRound,
  };

  await updateDoc(roomRef(code), {
    [`players.${playerId}.card.actionCard.used`]: true,
    "game.gameLog": [...(room.game.gameLog || []), log],
    updatedAt: Date.now(),
  });
}

export async function confirmActionCard(
  code: string,
  playerId: string,
  approved: boolean,
  hostNote: string
): Promise<void> {
  const room = await getRoomData(code);
  const player = room.players[playerId];
  const log: GameLogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    type: "action",
    message: approved
      ? `✓ Хост подтвердил карту ${player?.name}: ${hostNote}`
      : `✗ Хост отклонил карту ${player?.name}`,
    playerId,
    round: room.game.currentRound,
  };

  const updates: Record<string, unknown> = {
    "game.gameLog": [...(room.game.gameLog || []), log],
    updatedAt: Date.now(),
  };

  if (approved) {
    updates[`players.${playerId}.card.actionCard.used`] = true;
  }

  await updateDoc(roomRef(code), updates);
}

export async function startVoting(code: string): Promise<void> {
  await updateDoc(roomRef(code), {
    "game.phase": "voting",
    "game.votes": [],
    "game.voteResults": {},
    updatedAt: Date.now(),
  });
}

export async function castVote(
  code: string,
  voterId: string,
  targetId: string,
  weight = 1
): Promise<void> {
  const room = await getRoomData(code);
  const votes = (room.game.votes || []).filter((v) => v.voterId !== voterId);
  const vote: Vote = {
    voterId,
    targetId,
    weight,
    timestamp: Date.now(),
  };
  votes.push(vote);

  const results: Record<string, number> = {};
  votes.forEach((v) => {
    results[v.targetId] = (results[v.targetId] || 0) + v.weight;
  });

  await updateDoc(roomRef(code), {
    "game.votes": votes,
    "game.voteResults": results,
    updatedAt: Date.now(),
  });
}

export async function eliminatePlayer(
  code: string,
  playerId: string
): Promise<void> {
  const room = await getRoomData(code);
  const player = room.players[playerId];
  const log: GameLogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    type: "elimination",
    message: `${player?.name} изгнан из бункера`,
    playerId,
    round: room.game.currentRound,
  };

  await updateDoc(roomRef(code), {
    [`players.${playerId}.isEliminated`]: true,
    "game.phase": "elimination",
    "game.gameLog": [...(room.game.gameLog || []), log],
    updatedAt: Date.now(),
  });

  const remaining = countActive({ ...room, players: { ...room.players, [playerId]: { ...player!, isEliminated: true } } });
  if (remaining <= room.settings.bunkerSlots) {
    await finishGame(code);
  }
}

export async function nextRound(code: string): Promise<void> {
  const room = await getRoomData(code);
  const next = room.game.currentRound + 1;
  await updateDoc(roomRef(code), {
    "game.currentRound": next,
    "game.phase": "reveal",
    "game.currentReveal": getRevealForRound(next),
    "game.discussionEndsAt": null,
    "game.activeGoodEvent": null,
    "game.activeBadEvent": null,
    "game.votes": [],
    "game.voteResults": {},
    updatedAt: Date.now(),
  });
}

export async function finishGame(code: string): Promise<void> {
  const room = await getRoomData(code);
  const scenario = (room as Room & { scenario: Scenario }).scenario;
  let finalStory = "";
  if (scenario) {
    finalStory = generateFinalStory(room, scenario);
  }
  if (room.game.customFinalStory) {
    finalStory = room.game.customFinalStory + "\n\n" + finalStory;
  }

  const allPlayers = Object.values(room.players);
  const revealAll: Record<string, unknown> = {};
  allPlayers.forEach((p) => {
    if (p.card) {
      revealAll[`players.${p.id}.revealed`] = {
        profession: true,
        workExperience: true,
        bio: true,
        health: true,
        hobbyOrSkill: true,
        baggage: true,
        fact1: true,
        fact2: true,
        phobia: true,
        friendCard: true,
        enemyCard: true,
      };
    }
  });

  await updateDoc(roomRef(code), {
    ...revealAll,
    status: "finished",
    "game.phase": "final",
    "game.finalStory": finalStory,
    "game.finishedAt": Date.now(),
    updatedAt: Date.now(),
  });
}

export async function setCustomFinalStory(
  code: string,
  story: string
): Promise<void> {
  await updateDoc(roomRef(code), {
    "game.customFinalStory": story,
    updatedAt: Date.now(),
  });
}

export function getActivePlayerCount(room: Room): number {
  return countActive(room);
}

export function getPublicPlayerCard(player: Player, room: Room) {
  const card = player.card;
  if (!card) return null;
  const r = player.revealed;
  const hideRelations = room.settings.hideFriendEnemyUntilFinal && room.status !== "finished";

  return {
    id: player.id,
    name: player.name,
    isEliminated: player.isEliminated,
    profession: r.profession ? card.profession : null,
    workExperience: r.workExperience ? card.workExperience : null,
    bio: r.bio ? card.bio : null,
    health: r.health ? card.health : null,
    phobia: r.phobia ? card.phobia : null,
    hobbyOrSkill: r.hobbyOrSkill ? card.hobbyOrSkill : null,
    fact1: r.fact1 ? card.fact1 : null,
    fact2: r.fact2 ? card.fact2 : null,
    baggage: r.baggage ? card.baggage : null,
    friendCard: (r.friendCard || !hideRelations) ? card.friendCard : null,
    enemyCard: (r.enemyCard || !hideRelations) ? card.enemyCard : null,
    actionCardUsed: card.actionCard?.used,
    revealed: r,
  };
}
