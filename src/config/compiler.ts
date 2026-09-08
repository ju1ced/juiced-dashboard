import { createDefaultConfig } from "./defaults";
import {
  CONFIG_SCHEMA_VERSION,
  START_VIEWS,
  THEME_MODES,
  type EditorRoomConfig,
  type GeneralConfig,
  type JuicedDashboardConfigV1,
  type StartView,
  type ThemeMode,
} from "./types";
import type { RoomConfig } from "../cards/juiced-dashboard-room-card";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function asStartView(value: unknown, fallback: StartView): StartView {
  return typeof value === "string" && (START_VIEWS as readonly string[]).includes(value) ? (value as StartView) : fallback;
}

function asThemeMode(value: unknown, fallback: ThemeMode): ThemeMode {
  return typeof value === "string" && (THEME_MODES as readonly string[]).includes(value) ? (value as ThemeMode) : fallback;
}

let roomKeySeed = 0;

function generateRoomKey(): string {
  roomKeySeed += 1;
  return `room-${Date.now().toString(36)}-${roomKeySeed}`;
}

function compileGeneral(raw: unknown): GeneralConfig {
  const defaults = createDefaultConfig().general;
  if (!isRecord(raw)) return defaults;
  return {
    title: asString(raw.title, defaults.title),
    start_view: asStartView(raw.start_view, defaults.start_view),
    theme_mode: asThemeMode(raw.theme_mode, defaults.theme_mode),
  };
}

function compileRoom(raw: unknown): EditorRoomConfig | null {
  if (!isRecord(raw)) return null;
  const name = asOptionalString(raw.name);
  if (!name) return null;
  return {
    key: asString(raw.key, generateRoomKey()),
    name,
    icon: asOptionalString(raw.icon),
    temperature_entity: asOptionalString(raw.temperature_entity),
    humidity_entity: asOptionalString(raw.humidity_entity),
    light_entity: asOptionalString(raw.light_entity),
    cover_entity: asOptionalString(raw.cover_entity),
    awning_entity: asOptionalString(raw.awning_entity),
    media_player_entity: asOptionalString(raw.media_player_entity),
    climate_entity: asOptionalString(raw.climate_entity),
  };
}

function compileRooms(raw: unknown): EditorRoomConfig[] {
  if (!Array.isArray(raw)) return [];
  const rooms: EditorRoomConfig[] = [];
  for (const item of raw) {
    const room = compileRoom(item);
    if (room) rooms.push(room);
  }
  return rooms;
}

/**
 * Fills in defaults for anything missing or malformed. Never throws — this
 * runs on whatever Home Assistant hands back as stored dashboard config,
 * which can be `undefined` (brand new dashboard) or partially edited.
 */
export function compileConfig(raw: unknown): JuicedDashboardConfigV1 {
  const source = isRecord(raw) ? raw : {};
  return {
    type: "custom:juiced-dashboard",
    schema_version: CONFIG_SCHEMA_VERSION,
    general: compileGeneral(source.general),
    rooms: compileRooms(source.rooms),
  };
}

/** Expands the flat, GUI-editable room shape into the card's array-based RoomConfig. */
export function compileRoomForCard(room: EditorRoomConfig): RoomConfig {
  return {
    name: room.name,
    icon: room.icon,
    temperature: room.temperature_entity,
    humidity: room.humidity_entity,
    lights: room.light_entity ? [{ entity: room.light_entity }] : [],
    covers: room.cover_entity ? [{ entity: room.cover_entity }] : [],
    awnings: room.awning_entity ? [{ entity: room.awning_entity }] : [],
    media_player: room.media_player_entity,
    climate: room.climate_entity,
  };
}
