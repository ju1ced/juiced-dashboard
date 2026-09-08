/**
 * "Vandaag" hero card: weather, a handful of energy KPIs, and waste sensors
 * — the calm, glanceable top of Home. Everything is optional; a tile whose
 * entity isn't configured (or is missing/unavailable) is simply omitted,
 * never fabricated.
 */

import { entityState, escapeHtml, formatNumber, formatTemp, isUnavailable } from "./juiced-dashboard-room-card";
import type { HomeAssistant } from "./juiced-dashboard-room-card";
import type { TodayConfig } from "../config/types";

export interface JuicedDashboardTodayCardConfig {
  type: "custom:juiced-dashboard-today-card";
  today: TodayConfig;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

interface EnergyTileDef {
  key: keyof Pick<TodayConfig, "battery_soc_entity" | "battery_charge_entity" | "battery_discharge_entity" | "solar_power_entity" | "home_consumption_entity" | "monthly_peak_entity">;
  label: string;
}

const ENERGY_TILES: readonly EnergyTileDef[] = [
  { key: "battery_soc_entity", label: "Thuisbatterij SoC" },
  { key: "battery_charge_entity", label: "Batterij laden" },
  { key: "battery_discharge_entity", label: "Batterij ontladen" },
  { key: "solar_power_entity", label: "Zonnepanelen opbrengst" },
  { key: "home_consumption_entity", label: "Huisverbruik" },
  { key: "monthly_peak_entity", label: "Maandelijkse vermogenspiek" },
];

function unitFor(hass: HomeAssistant | null, entityId: string | undefined): string {
  const state = entityState(hass, entityId);
  const unit = state?.attributes?.["unit_of_measurement"];
  return typeof unit === "string" ? unit : "";
}

function humanizeCondition(condition: string): string {
  const labels: Record<string, string> = {
    "clear-night": "Helder",
    cloudy: "Bewolkt",
    exceptional: "Uitzonderlijk",
    fog: "Mist",
    hail: "Hagel",
    lightning: "Onweer",
    "lightning-rainy": "Onweer met regen",
    partlycloudy: "Half bewolkt",
    pouring: "Zware regen",
    rainy: "Regenachtig",
    snowy: "Sneeuw",
    "snowy-rainy": "Natte sneeuw",
    sunny: "Zonnig",
    windy: "Winderig",
    "windy-variant": "Winderig",
  };
  return labels[condition] || condition;
}

const WEEKDAY_LABELS = ["zo", "ma", "di", "wo", "do", "vr", "za"];

/** Parses a waste-collection sensor's state — "DD-MM-YYYY", "YYYY-MM-DD", or anything `Date` can parse. Returns null when unparseable. */
export function parseWasteDate(value: string): Date | null {
  const dmy = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const ymd = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Calendar-day distance from today (ignores time-of-day), positive = future. */
export function daysUntil(date: Date, now: Date = new Date()): number {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000);
}

export function relativeWasteLabel(days: number): string {
  if (days === 0) return "Vandaag";
  if (days === 1) return "Morgen";
  if (days > 1) return `Over ${days} dagen`;
  if (days === -1) return "Gisteren";
  return `${Math.abs(days)} dagen geleden`;
}

export class JuicedDashboardTodayCard extends HTMLElementBase {
  private _config: JuicedDashboardTodayCardConfig | null = null;
  private _hass: HomeAssistant | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  private get root(): ShadowRoot {
    return this.shadowRoot as ShadowRoot;
  }

  static getStubConfig(): JuicedDashboardTodayCardConfig {
    return {
      type: "custom:juiced-dashboard-today-card",
      today: { weather_entity: "weather.thuis", waste_entities: [] },
    };
  }

  setConfig(config: JuicedDashboardTodayCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("juiced-dashboard-today-card: invalid configuration.");
    }
    this._config = config;
    this._render();
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this._render();
  }

  get hass(): HomeAssistant | null {
    return this._hass;
  }

  getCardSize(): number {
    return 3;
  }

  private _render(): void {
    if (!this._config) return;
    const today = this._config.today ?? { waste_entities: [] };
    const hass = this._hass;

    const weatherHtml = this._weatherHtml(hass, today.weather_entity);
    const energyHtml = this._energyHtml(hass, today);
    const wasteHtml = this._wasteHtml(hass, today.waste_entities ?? []);

    this.root.innerHTML = `
      <style>${CARD_CSS}</style>
      <ha-card class="jtc-shell">
        ${weatherHtml}
        ${energyHtml}
        ${wasteHtml}
      </ha-card>`;
  }

  private _weatherHtml(hass: HomeAssistant | null, entityId: string | undefined): string {
    const state = entityState(hass, entityId);
    if (!entityId || !state || isUnavailable(state.state)) return "";
    const temp = formatTemp(state.attributes?.["temperature"], 1);
    return `
      <div class="jtc-weather">
        <div>
          <div class="jtc-weather-cond">${escapeHtml(humanizeCondition(state.state))}</div>
          <div class="jtc-weather-loc">Thuis &middot; nu</div>
        </div>
        ${temp ? `<div class="jtc-weather-temp">${escapeHtml(temp)}</div>` : ""}
      </div>`;
  }

  private _energyHtml(hass: HomeAssistant | null, today: TodayConfig): string {
    const tiles = ENERGY_TILES.map((def) => {
      const entityId = today[def.key];
      const state = entityState(hass, entityId);
      if (!entityId || !state || isUnavailable(state.state)) return "";
      const value = formatNumber(state.state, 1);
      if (value === null) return "";
      const unit = unitFor(hass, entityId);
      return `
        <div class="jtc-tile">
          <div class="jtc-tile-value">${escapeHtml(value)}${unit ? ` <span class="jtc-tile-unit">${escapeHtml(unit)}</span>` : ""}</div>
          <div class="jtc-tile-label">${escapeHtml(def.label)}</div>
        </div>`;
    }).join("");
    if (!tiles) return "";
    return `<div class="jtc-energy">${tiles}</div>`;
  }

  private _wasteHtml(hass: HomeAssistant | null, wasteEntities: string[]): string {
    const chips = wasteEntities
      .map((entityId) => {
        const state = entityState(hass, entityId);
        if (!state || isUnavailable(state.state)) return "";
        const name = state.attributes?.["friendly_name"];
        const label = typeof name === "string" && name ? name : entityId;
        const date = parseWasteDate(state.state);
        const dateHtml =
          date === null
            ? `<span class="jtc-waste-wd">${escapeHtml(state.state)}</span>`
            : `<span class="jtc-waste-day">${date.getDate()}</span><span class="jtc-waste-wd">${WEEKDAY_LABELS[date.getDay()]}</span>`;
        const relative = date === null ? "" : relativeWasteLabel(daysUntil(date));
        return `
          <div class="jtc-waste-chip">
            <div class="jtc-waste-date">${dateHtml}</div>
            <div class="jtc-waste-text">
              <div class="jtc-waste-name">${escapeHtml(label)}</div>
              ${relative ? `<div class="jtc-waste-value">${escapeHtml(relative)}</div>` : ""}
            </div>
          </div>`;
      })
      .filter(Boolean)
      .join("");
    if (!chips) return "";
    return `
      <div class="jtc-waste">
        <h4>Afvalophaling</h4>
        <div class="jtc-waste-row">${chips}</div>
      </div>`;
  }
}

const CARD_CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jtc-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    padding: 18px 20px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .jtc-weather { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; }
  .jtc-weather-cond { font-size: 15px; font-weight: 700; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jtc-weather-loc { font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; }
  .jtc-weather-temp { font-size: 30px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }

  .jtc-energy {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    padding: 14px 0; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color));
  }
  .jtc-tile-value { font-size: 15px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jtc-tile-unit { font-size: 11px; font-weight: 600; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jtc-tile-label { font-size: 10.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; line-height: 1.3; }

  .jtc-waste { padding-top: 14px; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jtc-waste h4 {
    margin: 0 0 10px; font-size: 11.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }
  .jtc-waste-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
  .jtc-waste-chip {
    display: flex; align-items: center; gap: 10px;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.04)));
    border-radius: 12px; padding: 10px;
  }
  .jtc-waste-date {
    display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none;
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--juiced-surface-raised, var(--card-background-color, #fff));
    color: var(--juiced-brand-primary, var(--primary-color));
  }
  .jtc-waste-day { font-size: 15px; font-weight: 800; line-height: 1.1; }
  .jtc-waste-wd { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
  .jtc-waste-text { min-width: 0; }
  .jtc-waste-name {
    font-size: 11.5px; font-weight: 700; color: var(--juiced-text-primary, var(--primary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jtc-waste-value { font-size: 10.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; }

  @media (max-width: 480px) { .jtc-energy { grid-template-columns: repeat(2, 1fr); } }
`;

export function registerJuicedDashboardTodayCard(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("juiced-dashboard-today-card")) {
    customElements.define("juiced-dashboard-today-card", JuicedDashboardTodayCard);
  }
  if (typeof window !== "undefined") {
    window.customCards = window.customCards || [];
    if (!window.customCards.some((card) => card.type === "juiced-dashboard-today-card")) {
      window.customCards.push({
        type: "juiced-dashboard-today-card",
        name: "Juiced Dashboard — Vandaag",
        description: "Weer, energie-KPI's en afvalophaling in één rustige kaart.",
        preview: false,
        documentationURL: "https://github.com/ju1ced/juiced-dashboard",
      });
    }
  }
}
