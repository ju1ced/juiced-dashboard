/**
 * Config schema for the `custom:juiced-dashboard` dashboard strategy.
 *
 * Deliberately small for schema v1 — general settings + a flat, GUI-editable
 * room shape (one entity per category). `compileRoomForCard` in
 * `./compiler.ts` expands that flat shape into the array-based `RoomConfig`
 * that `juiced-dashboard-room-card` already accepts. Later slices grow this
 * (today/energy/security/actions) without breaking what's here.
 */

export const CONFIG_SCHEMA_VERSION = 1 as const;

export const VIEW_PATHS = ["home", "rooms", "energy", "domains", "more"] as const;
export type ViewPath = (typeof VIEW_PATHS)[number];

export const START_VIEWS = ["home", "rooms"] as const;
export type StartView = (typeof START_VIEWS)[number];

export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export type EntityReference = string;

export interface GeneralConfig {
  title: string;
  start_view: StartView;
  theme_mode: ThemeMode;
}

/** The flat, GUI-editable room shape — one entity per control category. */
export interface EditorRoomConfig {
  key: string;
  name: string;
  icon?: string;
  temperature_entity?: EntityReference;
  humidity_entity?: EntityReference;
  light_entity?: EntityReference;
  cover_entity?: EntityReference;
  awning_entity?: EntityReference;
  media_player_entity?: EntityReference;
  climate_entity?: EntityReference;
}

export interface JuicedDashboardConfigV1 {
  type: "custom:juiced-dashboard";
  schema_version: typeof CONFIG_SCHEMA_VERSION;
  general: GeneralConfig;
  rooms: EditorRoomConfig[];
}
