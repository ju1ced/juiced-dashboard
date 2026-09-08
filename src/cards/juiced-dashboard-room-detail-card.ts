/**
 * Room detail subview content: a hero (icon + name) and a small "Overzicht"
 * status grid, followed by the same per-category sections the room card's
 * popup already renders — Klimaat, Verlichting, Rolluiken, Luifels, Media
 * — reused as-is via the exported `roomSection*` helpers so the two
 * surfaces (quick popup, full subview page) never drift apart.
 *
 * A category with nothing configured is simply omitted, same as the popup.
 */

import {
  closeCover,
  entityState,
  escapeHtml,
  formatNumber,
  formatTemp,
  hvacModeLabel,
  isUnavailable,
  openCover,
  roomIconSvg,
  roomLightsOn,
  roomSectionClimate,
  roomSectionCovers,
  roomSectionLights,
  roomSectionMedia,
  setHvacMode,
  stepClimateTarget,
  stopCover,
  toggleLight,
  toggleMediaPlayPause,
} from "./juiced-dashboard-room-card";
import type { HomeAssistant, RoomConfig } from "./juiced-dashboard-room-card";

export interface JuicedDashboardRoomDetailCardConfig {
  type: "custom:juiced-dashboard-room-detail-card";
  room: RoomConfig;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

function overviewTiles(hass: HomeAssistant | null, room: RoomConfig): string {
  const tiles: string[] = [];

  const tempObj = entityState(hass, room.temperature);
  if (tempObj && !isUnavailable(tempObj.state)) {
    const value = formatTemp(tempObj.state, 1);
    if (value) tiles.push(`<div class="jrd-tile"><div class="jrd-tile-value">${escapeHtml(value)}</div><div class="jrd-tile-label">Temperatuur</div></div>`);
  }

  const humObj = entityState(hass, room.humidity);
  if (humObj && !isUnavailable(humObj.state)) {
    const value = formatNumber(humObj.state, 0);
    if (value) tiles.push(`<div class="jrd-tile"><div class="jrd-tile-value">${escapeHtml(value)}<span class="jrd-tile-unit">%</span></div><div class="jrd-tile-label">Vochtigheid</div></div>`);
  }

  const lights = room.lights || [];
  if (lights.length > 0) {
    const on = roomLightsOn(hass, room);
    tiles.push(`<div class="jrd-tile"><div class="jrd-tile-value">${on}<span class="jrd-tile-unit">/${lights.length}</span></div><div class="jrd-tile-label">Lampen aan</div></div>`);
  }

  if (room.climate) {
    const stateObj = entityState(hass, room.climate);
    if (stateObj && !isUnavailable(stateObj.state)) {
      const target = formatTemp(stateObj.attributes?.["temperature"], 1);
      tiles.push(
        `<div class="jrd-tile"><div class="jrd-tile-value">${escapeHtml(hvacModeLabel(stateObj.state))}</div><div class="jrd-tile-label">Klimaat${target ? ` · doel ${escapeHtml(target)}` : ""}</div></div>`,
      );
    }
  }

  if (!tiles.length) return "";
  return `<div class="jrd-overview">${tiles.join("")}</div>`;
}

export class JuicedDashboardRoomDetailCard extends HTMLElementBase {
  private _config: JuicedDashboardRoomDetailCardConfig | null = null;
  private _hass: HomeAssistant | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onClick = this._onClick.bind(this);
  }

  private get root(): ShadowRoot {
    return this.shadowRoot as ShadowRoot;
  }

  static getStubConfig(): JuicedDashboardRoomDetailCardConfig {
    return {
      type: "custom:juiced-dashboard-room-detail-card",
      room: { name: "Bureau", icon: "mdi:desk" },
    };
  }

  setConfig(config: JuicedDashboardRoomDetailCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("juiced-dashboard-room-detail-card: invalid configuration.");
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
    return 5;
  }

  connectedCallback(): void {
    this.root.addEventListener("click", this._onClick as EventListener);
  }

  disconnectedCallback(): void {
    this.root.removeEventListener("click", this._onClick as EventListener);
  }

  private _render(): void {
    if (!this._config) return;
    const room = this._config.room;
    const hass = this._hass;

    const overview = overviewTiles(hass, room);
    const sections = [
      roomSectionClimate(hass, room),
      roomSectionLights(hass, room),
      roomSectionCovers(hass, room, "covers", "Rolluiken"),
      roomSectionCovers(hass, room, "awnings", "Luifels"),
      roomSectionMedia(hass, room),
    ]
      .filter(Boolean)
      .join("");

    const body = overview || sections ? `${overview}${sections}` : `<p class="jrd-empty">Geen bediening of sensoren geconfigureerd voor deze kamer.</p>`;

    this.root.innerHTML = `
      <style>${CARD_CSS}</style>
      <ha-card class="jrd-shell">
        <div class="jrd-hero">
          <span class="jrd-hero-ic">${roomIconSvg(room.icon)}</span>
          <h2 class="jrd-hero-name">${escapeHtml(room.name)}</h2>
        </div>
        <div class="jrd-body">${body}</div>
      </ha-card>`;
  }

  private _onClick(event: MouseEvent): void {
    const origin = event.target as HTMLElement | null;
    const target = origin?.closest<HTMLElement>("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const hass = this._hass;

    if (action === "toggle-light") {
      toggleLight(hass, target.dataset.entity);
      return;
    }
    if (action === "cover-open") {
      openCover(hass, target.dataset.entity);
      return;
    }
    if (action === "cover-close") {
      closeCover(hass, target.dataset.entity);
      return;
    }
    if (action === "cover-stop") {
      stopCover(hass, target.dataset.entity);
      return;
    }
    if (action === "media-toggle") {
      toggleMediaPlayPause(hass, target.dataset.entity);
      return;
    }
    if (action === "climate-mode") {
      setHvacMode(hass, target.dataset.entity, target.dataset.mode);
      return;
    }
    if (action === "climate-step") {
      stepClimateTarget(hass, target.dataset.entity, target.dataset.target, Number(target.dataset.step));
      return;
    }
  }
}

const CARD_CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jrd-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    overflow: hidden;
  }

  .jrd-hero { display: flex; align-items: center; gap: 13px; padding: 18px 20px 14px; }
  .jrd-hero-ic {
    width: 44px; height: 44px; border-radius: 13px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-brand-primary, var(--primary-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-hero-ic ha-icon { --mdc-icon-size: 22px; }
  .jrd-hero-name { margin: 0; font-size: 19px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }

  .jrd-body { padding: 0 20px 18px; }
  .jrd-empty { color: var(--juiced-text-muted, var(--secondary-text-color)); font-size: 12.5px; padding: 10px 0; }

  .jrd-overview {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px;
    padding-bottom: 14px; border-bottom: 1px solid var(--juiced-border-subtle, var(--divider-color)); margin-bottom: 4px;
  }
  .jrd-tile {
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.04)));
    border-radius: 12px; padding: 10px 12px;
  }
  .jrd-tile-value { font-size: 15px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-tile-unit { font-size: 11px; font-weight: 600; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jrd-tile-label { font-size: 10.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 2px; line-height: 1.3; }

  .jrd-body .jrc-section { padding: 14px 0; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jrd-body .jrc-section:first-of-type { border-top: 0; padding-top: 0; }
  .jrd-body .jrc-section h4 {
    margin: 0 0 8px; font-size: 11.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }

  .jrd-body .jrc-lightrow { display: flex; align-items: center; gap: 11px; padding: 8px 0; }
  .jrd-body .jrc-lrow-ic {
    width: 32px; height: 32px; border-radius: 9px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-body .jrc-lightrow.on .jrc-lrow-ic {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
  }
  .jrd-body .jrc-lrow-text { display: flex; flex-direction: column; line-height: 1.25; }
  .jrd-body .jrc-lrow-name { font-weight: 600; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-lrow-sub { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jrd-body .jrc-toggle {
    margin-left: auto; width: 40px; height: 24px; border-radius: 99px; position: relative; flex: none; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
  }
  .jrd-body .jrc-toggle i {
    position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 99px;
    background: var(--juiced-surface-raised, #fff); box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: left .15s ease;
  }
  .jrd-body .jrc-toggle.on { background: var(--juiced-brand-primary, var(--primary-color)); border-color: transparent; }
  .jrd-body .jrc-toggle.on i { left: 18px; background: var(--juiced-text-inverse, #fff); }
  .jrd-body .jrc-toggle:disabled { opacity: .5; cursor: default; }

  .jrd-body .jrc-coverrow { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
  .jrd-body .jrc-cr-name { font-size: 13px; font-weight: 600; flex: 1; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-cr-pos { font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); width: 34px; text-align: right; }
  .jrd-body .jrc-cr-btns { display: flex; gap: 4px; }
  .jrd-body .jrc-cr-btns button {
    width: 28px; height: 28px; border-radius: 8px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }

  .jrd-body .jrc-media { display: flex; align-items: center; gap: 12px; }
  .jrd-body .jrc-media-ic {
    width: 40px; height: 40px; border-radius: 12px; flex: none; color: #fff;
    background: linear-gradient(155deg, var(--juiced-brand-primary, var(--primary-color)), var(--juiced-brand-secondary, var(--accent-color, #7ee787)));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-body .jrc-media-text { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .jrd-body .jrc-media-name { font-weight: 700; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-media-sub {
    font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jrd-body .jrc-media-btn {
    margin-left: auto; width: 34px; height: 34px; border-radius: 999px; flex: none; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent);
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrd-body .jrc-media-btn.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }

  .jrd-body .jrc-kv { display: flex; justify-content: space-between; font-size: 13px; padding-bottom: 10px; }
  .jrd-body .jrc-kv span:first-child { color: var(--juiced-text-secondary, var(--primary-text-color)); }
  .jrd-body .jrc-kv .ok { font-weight: 700; color: var(--juiced-status-ok, var(--state-active-color, #2e7d43)); }
  .jrd-body .jrc-pillrow { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .jrd-body .jrc-pill {
    border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
  }
  .jrd-body .jrc-pill.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }
  .jrd-body .jrc-stepper { display: flex; align-items: center; justify-content: center; gap: 18px; }
  .jrd-body .jrc-stepper button {
    width: 34px; height: 34px; border-radius: 999px; font-size: 16px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrd-body .jrc-stepper-mid { text-align: center; }
  .jrd-body .jrc-stepper-mid .v { font-size: 26px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrd-body .jrc-stepper-mid .l { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
`;

export function registerJuicedDashboardRoomDetailCard(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("juiced-dashboard-room-detail-card")) {
    customElements.define("juiced-dashboard-room-detail-card", JuicedDashboardRoomDetailCard);
  }
  if (typeof window !== "undefined") {
    window.customCards = window.customCards || [];
    if (!window.customCards.some((card) => card.type === "juiced-dashboard-room-detail-card")) {
      window.customCards.push({
        type: "juiced-dashboard-room-detail-card",
        name: "Juiced Dashboard — Kamerdetail",
        description: "Volledige kamerpagina: overzicht, klimaat, verlichting, rolluiken/luifels en media.",
        preview: false,
        documentationURL: "https://github.com/ju1ced/juiced-dashboard",
      });
    }
  }
}
