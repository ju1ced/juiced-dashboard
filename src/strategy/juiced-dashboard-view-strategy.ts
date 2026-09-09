/**
 * Home Assistant view strategy for `custom:juiced-dashboard-view` — generates
 * the actual card layout for one view. The dashboard strategy
 * (`juiced-dashboard-strategy.ts`) assigns one of these per view, each with
 * its own embedded config slice.
 */

import { compileRoomForCard } from "../config/compiler";
import { registerJuicedDashboardQuickActions } from "../cards/juiced-dashboard-quick-actions";
import { registerJuicedDashboardRoomDetailCard } from "../cards/juiced-dashboard-room-detail-card";
import { registerJuicedDashboardSecurityCard } from "../cards/juiced-dashboard-security-card";
import { registerJuicedDashboardTodayCard } from "../cards/juiced-dashboard-today-card";
import type { EditorRoomConfig, GeneralConfig, QuickActionConfig, SecurityConfig, ShortcutConfig, TodayConfig, ViewPath } from "../config/types";

export interface JuicedDashboardViewConfig {
  type: "custom:juiced-dashboard-view";
  view: ViewPath | "room";
  general: GeneralConfig;
  today?: TodayConfig;
  quick_actions?: QuickActionConfig[];
  security?: SecurityConfig;
  shortcuts?: ShortcutConfig[];
  rooms?: EditorRoomConfig[];
  room?: EditorRoomConfig;
}

type LovelaceConfig = Record<string, unknown>;

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function markdown(content: string, title?: string): LovelaceConfig {
  return { type: "markdown", ...(title ? { title } : {}), content, grid_options: GRID_FULL };
}

const ROOMS_TITLE = "Kamers";
const ROOMS_SUBTITLE = "Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen";

/**
 * max_columns caps how many section-columns HA *may* lay out at a given
 * viewport width — it does not stretch a lone column to fill the row (a
 * view with max_columns:1 renders one narrow, minimum-width column,
 * centered, no matter how wide the screen is). Every section here gives
 * column_span == FULL_SPAN so it always claims the full row width HA
 * actually computed for this viewport instead of just one column-track.
 */
const FULL_SPAN = 4;

/**
 * Measured live: a custom card with no grid_options defaults to roughly a
 * third of its section's width (a 4-of-12-column span), not the full 12
 * columns the docs describe — confirmed via a DOM walk-up on the live
 * dashboard (section container 1070px, card container only 351px). Every
 * card placed directly in one of our full-span sections needs this to
 * actually reach that width.
 */
const GRID_FULL = { columns: "full" } as const;

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

function quickActionsSection(actions: QuickActionConfig[] | undefined): LovelaceConfig | undefined {
  if (!actions || actions.length === 0) return undefined;
  return { type: "grid", column_span: FULL_SPAN, cards: [{ type: "custom:juiced-dashboard-quick-actions", actions, grid_options: GRID_FULL }] };
}

function hasSecurityContent(security: SecurityConfig | undefined): boolean {
  if (!security) return false;
  return Boolean(security.alarm_entity || (security.cameras ?? []).length > 0);
}

/**
 * Vandaag + Security share one section so they sit in the same row and get
 * the same row height (HA's grid card stretches its children by default) —
 * two cards of very different content length looked visually mismatched as
 * separate sections.
 */
function heroSection(today: TodayConfig | undefined, security: SecurityConfig | undefined): LovelaceConfig | undefined {
  const cards: LovelaceConfig[] = [];
  if (hasTodayContent(today)) cards.push({ type: "custom:juiced-dashboard-today-card", today });
  if (hasSecurityContent(security)) cards.push({ type: "custom:juiced-dashboard-security-card", security });
  if (cards.length === 0) return undefined;
  if (cards.length === 1) return { type: "grid", column_span: FULL_SPAN, cards: [{ ...cards[0], grid_options: GRID_FULL }] };
  return {
    type: "grid",
    column_span: FULL_SPAN,
    cards: [{ type: "grid", columns: 2, square: false, grid_options: GRID_FULL, cards }],
  };
}

function roomsSection(rooms: EditorRoomConfig[]): LovelaceConfig {
  if (rooms.length === 0) {
    return { type: "grid", column_span: FULL_SPAN, cards: [markdown("Voeg kamers toe via **Dashboard bewerken → instellingen**.", ROOMS_TITLE)] };
  }
  return {
    type: "grid",
    column_span: FULL_SPAN,
    cards: [
      {
        type: "custom:juiced-dashboard-room-card",
        title: ROOMS_TITLE,
        subtitle: ROOMS_SUBTITLE,
        rooms: rooms.map(compileRoomForCard),
        grid_options: GRID_FULL,
      },
    ],
  };
}

/** "Gezin": one tile per configured person entity, in the gap between the hero row and Kamers — not view-level badges, which HA always pins to the very top. */
function familySection(general: GeneralConfig | undefined): LovelaceConfig | undefined {
  const entities = general?.person_entities ?? [];
  if (!entities.length) return undefined;
  return {
    type: "grid",
    column_span: FULL_SPAN,
    cards: [
      { type: "heading", heading: "Gezin", heading_style: "title", grid_options: GRID_FULL },
      ...entities.map((entity) => ({ type: "tile", entity, grid_options: { columns: 6 } })),
    ],
  };
}

/** "Snel naar": one-tap navigation to another dashboard or one of this dashboard's own other views. */
function shortcutsSection(shortcuts: ShortcutConfig[] | undefined): LovelaceConfig | undefined {
  if (!shortcuts || shortcuts.length === 0) return undefined;
  return {
    type: "grid",
    column_span: FULL_SPAN,
    cards: [
      { type: "heading", heading: "Snel naar", heading_style: "title", grid_options: GRID_FULL },
      ...shortcuts.map((shortcut) => ({
        type: "shortcut",
        label: shortcut.label,
        icon: shortcut.icon || "mdi:open-in-new",
        tap_action: { action: "navigate", navigation_path: shortcut.navigation_path },
        grid_options: { columns: 4 },
      })),
    ],
  };
}

function roomDetailSections(room: EditorRoomConfig | undefined): LovelaceConfig[] {
  if (!room) {
    return [{ type: "grid", column_span: FULL_SPAN, cards: [markdown("Deze kamerconfiguratie ontbreekt.", "Kamer")] }];
  }
  return [
    { type: "grid", column_span: FULL_SPAN, cards: [{ type: "custom:juiced-dashboard-room-detail-card", room: compileRoomForCard(room), grid_options: GRID_FULL }] },
  ];
}

function placeholderSections(title: string, note: string): LovelaceConfig[] {
  return [{ type: "grid", column_span: FULL_SPAN, cards: [markdown(note, title)] }];
}

export function buildView(config: JuicedDashboardViewConfig): LovelaceConfig {
  let sections: LovelaceConfig[];
  switch (config.view) {
    case "home":
      sections = [
        heroSection(config.today, config.security),
        familySection(config.general),
        shortcutsSection(config.shortcuts),
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
  return {
    type: "sections",
    max_columns: FULL_SPAN,
    dense_section_placement: true,
    sections,
  };
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
  registerJuicedDashboardRoomDetailCard();
  if (typeof customElements === "undefined") return;
  const tag = "ll-strategy-view-juiced-dashboard-view";
  if (!customElements.get(tag)) customElements.define(tag, JuicedDashboardViewStrategy);
}
