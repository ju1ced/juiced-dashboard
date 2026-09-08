/**
 * Home Assistant view strategy for `custom:juiced-dashboard-view` — generates
 * the actual card layout for one view. The dashboard strategy
 * (`juiced-dashboard-strategy.ts`) assigns one of these per view, each with
 * its own embedded config slice.
 */

import { compileRoomForCard } from "../config/compiler";
import type { EditorRoomConfig, GeneralConfig, ViewPath } from "../config/types";

export interface JuicedDashboardViewConfig {
  type: "custom:juiced-dashboard-view";
  view: ViewPath | "room";
  general: GeneralConfig;
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
  if (typeof customElements === "undefined") return;
  const tag = "ll-strategy-view-juiced-dashboard-view";
  if (!customElements.get(tag)) customElements.define(tag, JuicedDashboardViewStrategy);
}
