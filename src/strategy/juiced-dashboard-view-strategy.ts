/**
 * Home Assistant view strategy for `custom:juiced-dashboard-view` — generates
 * the actual card layout for one view. The dashboard strategy
 * (`juiced-dashboard-strategy.ts`) assigns one of these per view, each with
 * its own embedded config slice.
 */

import { compileRoomForCard } from "../config/compiler";
import { registerJuicedDashboardQuickActions } from "../cards/juiced-dashboard-quick-actions";
import { registerJuicedDashboardSecurityCard } from "../cards/juiced-dashboard-security-card";
import { registerJuicedDashboardTodayCard } from "../cards/juiced-dashboard-today-card";
import type { EditorRoomConfig, GeneralConfig, QuickActionConfig, SecurityConfig, TodayConfig, ViewPath } from "../config/types";

export interface JuicedDashboardViewConfig {
  type: "custom:juiced-dashboard-view";
  view: ViewPath | "room";
  general: GeneralConfig;
  today?: TodayConfig;
  quick_actions?: QuickActionConfig[];
  security?: SecurityConfig;
  rooms?: EditorRoomConfig[];
  room?: EditorRoomConfig;
}

type LovelaceConfig = Record<string, unknown>;

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function markdown(content: string, title?: string): LovelaceConfig {
  return { type: "markdown", ...(title ? { title } : {}), content };
}

const ROOMS_TITLE = "Kamers";
const ROOMS_SUBTITLE = "Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen";

function hasTodayContent(today: TodayConfig | undefined): boolean {
  if (!today) return false;
  return Boolean(
    today.weather_entity ||
      today.battery_soc_entity ||
      today.battery_charge_entity ||
      today.battery_discharge_entity ||
      today.solar_power_entity ||
      today.home_consumption_entity ||
      today.monthly_peak_entity ||
      (today.waste_entities ?? []).length > 0,
  );
}

function todaySection(today: TodayConfig | undefined): LovelaceConfig | undefined {
  if (!hasTodayContent(today)) return undefined;
  return { type: "grid", cards: [{ type: "custom:juiced-dashboard-today-card", today }] };
}

function quickActionsSection(actions: QuickActionConfig[] | undefined): LovelaceConfig | undefined {
  if (!actions || actions.length === 0) return undefined;
  return { type: "grid", cards: [{ type: "custom:juiced-dashboard-quick-actions", actions }] };
}

function hasSecurityContent(security: SecurityConfig | undefined): boolean {
  if (!security) return false;
  return Boolean(security.alarm_entity || (security.cameras ?? []).length > 0);
}

function securitySection(security: SecurityConfig | undefined): LovelaceConfig | undefined {
  if (!hasSecurityContent(security)) return undefined;
  return { type: "grid", cards: [{ type: "custom:juiced-dashboard-security-card", security }] };
}

function roomsSection(rooms: EditorRoomConfig[]): LovelaceConfig {
  if (rooms.length === 0) {
    return { type: "grid", cards: [markdown("Voeg kamers toe via **Dashboard bewerken → instellingen**.", ROOMS_TITLE)] };
  }
  return {
    type: "grid",
    cards: [
      {
        type: "custom:juiced-dashboard-room-card",
        title: ROOMS_TITLE,
        subtitle: ROOMS_SUBTITLE,
        rooms: rooms.map(compileRoomForCard),
      },
    ],
  };
}

function roomDetailSections(room: EditorRoomConfig | undefined): LovelaceConfig[] {
  if (!room) {
    return [{ type: "grid", cards: [markdown("Deze kamerconfiguratie ontbreekt.", "Kamer")] }];
  }
  const entities = [
    room.temperature_entity,
    room.humidity_entity,
    room.light_entity,
    room.cover_entity,
    room.awning_entity,
    room.media_player_entity,
    room.climate_entity,
  ].filter((id): id is string => Boolean(id));

  const cards: LovelaceConfig[] = [
    markdown(`Volledige kamerdetail (hero + secties zoals Klimaat/Verlichting/Sensoren/Media) voor **${room.name}** volgt in een volgende stap.`, room.name),
  ];
  if (entities.length > 0) {
    cards.push({ type: "entities", title: "Entiteiten in deze kamer", entities });
  }
  return [{ type: "grid", cards }];
}

function placeholderSections(title: string, note: string): LovelaceConfig[] {
  return [{ type: "grid", cards: [markdown(note, title)] }];
}

export function buildView(config: JuicedDashboardViewConfig): LovelaceConfig {
  let sections: LovelaceConfig[];
  switch (config.view) {
    case "home":
      sections = [
        todaySection(config.today),
        securitySection(config.security),
        quickActionsSection(config.quick_actions),
        roomsSection(config.rooms ?? []),
      ].filter((section): section is LovelaceConfig => Boolean(section));
      break;
    case "rooms":
      sections = [roomsSection(config.rooms ?? [])];
      break;
    case "room":
      sections = roomDetailSections(config.room);
      break;
    case "energy":
      sections = placeholderSections("Energie", "Energie-overzicht volgt in een volgende stap.");
      break;
    case "domains":
      sections = placeholderSections("Domeinen", "Specialistische domeinen (Kia, tuin, robotstofzuiger, zwembad) volgen in een volgende stap.");
      break;
    default:
      sections = placeholderSections("Meer", "Instellingen en geschiedenis volgen in een volgende stap.");
      break;
  }
  return { type: "sections", max_columns: 2, dense_section_placement: true, sections };
}

export class JuicedDashboardViewStrategy extends HTMLElementBase {
  static async generate(config: JuicedDashboardViewConfig): Promise<LovelaceConfig> {
    return buildView(config);
  }
}

export function registerJuicedDashboardViewStrategy(): void {
  registerJuicedDashboardTodayCard();
  registerJuicedDashboardQuickActions();
  registerJuicedDashboardSecurityCard();
  if (typeof customElements === "undefined") return;
  const tag = "ll-strategy-view-juiced-dashboard-view";
  if (!customElements.get(tag)) customElements.define(tag, JuicedDashboardViewStrategy);
}
