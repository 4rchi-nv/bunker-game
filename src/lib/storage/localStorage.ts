const KEYS = {
  playerName: "bunker_player_name",
  hostSettings: "bunker_host_settings",
  scenarioDraft: "bunker_scenario_draft",
  lastRoomCode: "bunker_last_room_code",
  playerRoom: "bunker_player_room",
} as const;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const storage = {
  getPlayerName(): string {
    return safeGet(KEYS.playerName) || "";
  },
  setPlayerName(name: string) {
    safeSet(KEYS.playerName, name);
  },
  getHostSettings<T>(): T | null {
    const raw = safeGet(KEYS.hostSettings);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setHostSettings<T>(settings: T) {
    safeSet(KEYS.hostSettings, JSON.stringify(settings));
  },
  getScenarioDraft(): string {
    return safeGet(KEYS.scenarioDraft) || "";
  },
  setScenarioDraft(draft: string) {
    safeSet(KEYS.scenarioDraft, draft);
  },
  clearScenarioDraft() {
    safeRemove(KEYS.scenarioDraft);
  },
  getLastRoomCode(): string {
    return safeGet(KEYS.lastRoomCode) || "";
  },
  setLastRoomCode(code: string) {
    safeSet(KEYS.lastRoomCode, code);
  },
  getPlayerRoom(): { roomCode: string; playerId: string } | null {
    const raw = safeGet(KEYS.playerRoom);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setPlayerRoom(roomCode: string, playerId: string) {
    safeSet(KEYS.playerRoom, JSON.stringify({ roomCode, playerId }));
  },
  clearPlayerRoom() {
    safeRemove(KEYS.playerRoom);
  },
};
