import { createDefaultConfig } from "./defaults";
import {
  CONFIG_SCHEMA_VERSION,
  ROOM_ZONES,
  START_VIEWS,
  THEME_MODES,
  type CameraConfig,
  type EditorRoomConfig,
  type GeneralConfig,
  type JuicedDashboardConfigV1,
  type QuickActionConfig,
  type RoomZone,
  type SecurityConfig,
  type ShortcutConfig,
  type StartView,
  type ThemeMode,
  type TodayConfig,
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

function asRoomZone(value: unknown): RoomZone | undefined {
  return typeof value === "string" && (ROOM_ZONES as readonly string[]).includes(value) ? (value as RoomZone) : undefined;
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
    person_entities: asStringArray(raw.person_entities),
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
    zone: asRoomZone(raw.zone),
    temperature_entity: asOptionalString(raw.temperature_entity),
    humidity_entity: asOptionalString(raw.humidity_entity),
    light_entities: asStringArray(raw.light_entities),
    cover_entities: asStringArray(raw.cover_entities),
    awning_entities: asStringArray(raw.awning_entities),
    media_player_entity: asOptionalString(raw.media_player_entity),
    climate_entity: asOptionalString(raw.climate_entity),
  };
}

function asStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function compileToday(raw: unknown): TodayConfig {
  if (!isRecord(raw)) return { waste_entities: [] };
  return {
    weather_entity: asOptionalString(raw.weather_entity),
    battery_soc_entity: asOptionalString(raw.battery_soc_entity),
    battery_charge_entity: asOptionalString(raw.battery_charge_entity),
    battery_discharge_entity: asOptionalString(raw.battery_discharge_entity),
    solar_power_entity: asOptionalString(raw.solar_power_entity),
    home_consumption_entity: asOptionalString(raw.home_consumption_entity),
    monthly_peak_entity: asOptionalString(raw.monthly_peak_entity),
    waste_entities: asStringArray(raw.waste_entities),
  };
}

let actionKeySeed = 0;

function generateActionKey(): string {
  actionKeySeed += 1;
  return `action-${Date.now().toString(36)}-${actionKeySeed}`;
}

function compileQuickAction(raw: unknown): QuickActionConfig | null {
  if (!isRecord(raw)) return null;
  const entity = asOptionalString(raw.entity);
  const service = asOptionalString(raw.service);
  if (!entity || !service) return null;
  return {
    key: asString(raw.key, generateActionKey()),
    label: asString(raw.label, entity),
    icon: asOptionalString(raw.icon),
    entity,
    service,
  };
}

function compileQuickActions(raw: unknown): QuickActionConfig[] {
  if (!Array.isArray(raw)) return [];
  const actions: QuickActionConfig[] = [];
  for (const item of raw) {
    const action = compileQuickAction(item);
    if (action) actions.push(action);
  }
  return actions;
}

let cameraKeySeed = 0;

function generateCameraKey(): string {
  cameraKeySeed += 1;
  return `camera-${Date.now().toString(36)}-${cameraKeySeed}`;
}

function compileCamera(raw: unknown): CameraConfig | null {
  if (!isRecord(raw)) return null;
  const name = asOptionalString(raw.name);
  const cameraEntity = asOptionalString(raw.camera_entity);
  if (!name || !cameraEntity) return null;
  return {
    key: asString(raw.key, generateCameraKey()),
    name,
    camera_entity: cameraEntity,
    privacy_entity: asOptionalString(raw.privacy_entity),
    privacy_service: asOptionalString(raw.privacy_service),
  };
}

function compileCameras(raw: unknown): CameraConfig[] {
  if (!Array.isArray(raw)) return [];
  const cameras: CameraConfig[] = [];
  for (const item of raw) {
    const camera = compileCamera(item);
    if (camera) cameras.push(camera);
  }
  return cameras;
}

function compileSecurity(raw: unknown): SecurityConfig {
  if (!isRecord(raw)) return { cameras: [] };
  return {
    alarm_entity: asOptionalString(raw.alarm_entity),
    cameras: compileCameras(raw.cameras),
  };
}

let shortcutKeySeed = 0;

function generateShortcutKey(): string {
  shortcutKeySeed += 1;
  return `shortcut-${Date.now().toString(36)}-${shortcutKeySeed}`;
}

function compileShortcut(raw: unknown): ShortcutConfig | null {
  if (!isRecord(raw)) return null;
  const navigationPath = asOptionalString(raw.navigation_path);
  if (!navigationPath) return null;
  return {
    key: asString(raw.key, generateShortcutKey()),
    label: asString(raw.label, navigationPath),
    icon: asOptionalString(raw.icon),
    navigation_path: navigationPath,
  };
}

function compileShortcuts(raw: unknown): ShortcutConfig[] {
  if (!Array.isArray(raw)) return [];
  const shortcuts: ShortcutConfig[] = [];
  for (const item of raw) {
    const shortcut = compileShortcut(item);
    if (shortcut) shortcuts.push(shortcut);
  }
  return shortcuts;
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
    today: compileToday(source.today),
    quick_actions: compileQuickActions(source.quick_actions),
    security: compileSecurity(source.security),
    shortcuts: compileShortcuts(source.shortcuts),
    rooms: compileRooms(source.rooms),
  };
}

/** Expands the GUI-editable room shape into the card's RoomConfig. */
export function compileRoomForCard(room: EditorRoomConfig): RoomConfig {
  return {
    name: room.name,
    icon: room.icon,
    zone: room.zone,
    temperature: room.temperature_entity,
    humidity: room.humidity_entity,
    lights: (room.light_entities ?? []).map((entity) => ({ entity })),
    covers: (room.cover_entities ?? []).map((entity) => ({ entity })),
    awnings: (room.awning_entities ?? []).map((entity) => ({ entity })),
    media_player: room.media_player_entity,
    climate: room.climate_entity,
  };
}
