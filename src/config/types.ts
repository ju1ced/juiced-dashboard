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

/** "Vandaag" hero: weather, a handful of energy KPIs, and waste sensors. All optional — an unset field's tile is simply omitted. */
export interface TodayConfig {
  weather_entity?: EntityReference;
  battery_soc_entity?: EntityReference;
  battery_charge_entity?: EntityReference;
  battery_discharge_entity?: EntityReference;
  solar_power_entity?: EntityReference;
  home_consumption_entity?: EntityReference;
  monthly_peak_entity?: EntityReference;
  waste_entities: EntityReference[];
}

/**
 * A single quick-action chip. `service` is the short service name
 * (e.g. "toggle", "turn_on", "alarm_arm_home") — the domain is derived from
 * `entity` at call time (`entity.split(".")[0]`), so a room light chip is
 * just `{entity: "light.x", service: "toggle"}`, no separate domain field.
 */
export interface QuickActionConfig {
  key: string;
  label: string;
  icon?: string;
  entity: EntityReference;
  service: string;
}

/**
 * A single camera. `privacy_entity` is optional and deliberately per-camera
 * — not every camera has a privacy switch, and the privacy chip only shows
 * for cameras that actually have one (see this session's design decision:
 * "privacy enkel bij relevante camera's").
 */
export interface CameraConfig {
  key: string;
  name: string;
  camera_entity: EntityReference;
  privacy_entity?: EntityReference;
  privacy_service?: string;
}

export interface SecurityConfig {
  alarm_entity?: EntityReference;
  cameras: CameraConfig[];
}

export interface JuicedDashboardConfigV1 {
  type: "custom:juiced-dashboard";
  schema_version: typeof CONFIG_SCHEMA_VERSION;
  general: GeneralConfig;
  today: TodayConfig;
  quick_actions: QuickActionConfig[];
  security: SecurityConfig;
  rooms: EditorRoomConfig[];
}
