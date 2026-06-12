import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteField,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb, ensureAnonymousAuth } from "@/lib/firebase";
import { generateRoomCode, generateId } from "@/lib/utils";
import type { Room, RoomSettings, Player, GameLogEntry } from "@/types/game";
import {
  DEFAULT_ROOM_SETTINGS,
  createEmptyGameSession,
} from "@/types/game";
import type { Scenario } from "@/types/scenario";

const COLLECTION = "rooms";

function roomRef(code: string) {
  return doc(getFirebaseDb(), COLLECTION, code.toUpperCase());
}

export async function createRoom(
  hostName: string,
  settings: Partial<RoomSettings> = {}
): Promise<{ room: Room; hostId: string }> {
  const hostId = await ensureAnonymousAuth();
  const code = generateRoomCode();
  const now = Date.now();

  const roomSettings: RoomSettings = {
    ...DEFAULT_ROOM_SETTINGS,
    ...settings,
  };

  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    isHost: true,
    isReady: true,
    isEliminated: false,
    card: null,
    revealed: {},
    joinedAt: now,
  };

  const room: Room = {
    id: code,
    code,
    hostId,
    hostName,
    settings: roomSettings,
    players: { [hostId]: hostPlayer },
    scenarioImported: false,
    game: createEmptyGameSession(),
    status: "waiting",
    createdAt: now,
    updatedAt: now,
  };

  if (!roomSettings.hostPlays) {
    room.players[hostId].isHost = true;
  }

  await setDoc(roomRef(code), {
    ...room,
    scenario: null,
  });

  return { room, hostId };
}

export async function getRoom(code: string): Promise<Room | null> {
  const snap = await getDoc(roomRef(code));
  if (!snap.exists()) return null;
  return snap.data() as Room;
}

export function subscribeToRoom(
  code: string,
  callback: (room: Room | null) => void
): Unsubscribe {
  return onSnapshot(
    roomRef(code),
    (snap) => {
      callback(snap.exists() ? (snap.data() as Room) : null);
    },
    () => callback(null)
  );
}

export async function joinRoom(
  code: string,
  playerName: string
): Promise<{ playerId: string; room: Room }> {
  const playerId = await ensureAnonymousAuth();
  const room = await getRoom(code);
  if (!room) throw new Error("Комната не найдена");
  if (room.status !== "waiting" && room.status !== "setup") {
    throw new Error("Игра уже началась");
  }

  const playerCount = Object.keys(room.players).length;
  if (playerCount >= room.settings.maxPlayers) {
    throw new Error("Комната заполнена");
  }

  const existing = room.players[playerId];
  if (existing) {
    await updateDoc(roomRef(code), {
      [`players.${playerId}.name`]: playerName,
      updatedAt: Date.now(),
    });
    return { playerId, room };
  }

  const player: Player = {
    id: playerId,
    name: playerName,
    isHost: false,
    isReady: false,
    isEliminated: false,
    card: null,
    revealed: {},
    joinedAt: Date.now(),
  };

  await updateDoc(roomRef(code), {
    [`players.${playerId}`]: player,
    updatedAt: Date.now(),
  });

  return { playerId, room: { ...room, players: { ...room.players, [playerId]: player } } };
}

export async function setPlayerReady(
  code: string,
  playerId: string,
  ready: boolean
): Promise<void> {
  await updateDoc(roomRef(code), {
    [`players.${playerId}.isReady`]: ready,
    updatedAt: Date.now(),
  });
}

export async function removePlayer(
  code: string,
  playerId: string
): Promise<void> {
  await updateDoc(roomRef(code), {
    [`players.${playerId}`]: deleteField(),
    updatedAt: Date.now(),
  });
}

export async function importScenario(
  code: string,
  scenario: Scenario
): Promise<void> {
  await updateDoc(roomRef(code), {
    scenario,
    scenarioImported: true,
    status: "setup",
    updatedAt: Date.now(),
  });
}

export async function updateRoom(
  code: string,
  data: Partial<Room>
): Promise<void> {
  await updateDoc(roomRef(code), {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function addLogEntry(
  code: string,
  entry: Omit<GameLogEntry, "id" | "timestamp">
): Promise<void> {
  const room = await getRoom(code);
  if (!room) return;
  const logEntry: GameLogEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  };
  const gameLog = [...(room.game?.gameLog || []), logEntry].slice(-100);
  await updateDoc(roomRef(code), {
    "game.gameLog": gameLog,
    updatedAt: Date.now(),
  });
}
