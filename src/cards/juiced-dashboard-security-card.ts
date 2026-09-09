/**
 * "Security" card: an optional alarm control row + an optional camera
 * carousel. Either half is simply omitted when not configured — a house
 * with no alarm panel doesn't get an empty alarm row, a house with one
 * camera doesn't get prev/next controls it doesn't need.
 *
 * Privacy is shown only for a camera that actually has a `privacy_entity`
 * configured — this session's explicit design decision earlier ("privacy
 * enkel bij relevante camera's").
 */

import { entityState, escapeHtml, isUnavailable } from "./juiced-dashboard-room-card";
import type { HomeAssistant } from "./juiced-dashboard-room-card";
import type { CameraConfig, SecurityConfig } from "../config/types";

export interface JuicedDashboardSecurityCardConfig {
  type: "custom:juiced-dashboard-security-card";
  security: SecurityConfig;
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

const ALARM_MODE_LABELS: Record<string, string> = {
  disarmed: "Uitgeschakeld",
  armed_home: "Ingeschakeld (thuis)",
  armed_away: "Ingeschakeld (afwezig)",
  armed_night: "Ingeschakeld (nacht)",
  arming: "Wordt ingeschakeld…",
  pending: "In afwachting…",
  triggered: "Alarm!",
};

export class JuicedDashboardSecurityCard extends HTMLElementBase {
  private _config: JuicedDashboardSecurityCardConfig | null = null;
  private _hass: HomeAssistant | null = null;
  private _cameraIndex = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onClick = this._onClick.bind(this);
  }

  private get root(): ShadowRoot {
    return this.shadowRoot as ShadowRoot;
  }

  static getStubConfig(): JuicedDashboardSecurityCardConfig {
    return {
      type: "custom:juiced-dashboard-security-card",
      security: { alarm_entity: "alarm_control_panel.huis", cameras: [] },
    };
  }

  setConfig(config: JuicedDashboardSecurityCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("juiced-dashboard-security-card: invalid configuration.");
    }
    this._config = config;
    this._cameraIndex = 0;
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

  connectedCallback(): void {
    this.root.addEventListener("click", this._onClick as EventListener);
  }

  disconnectedCallback(): void {
    this.root.removeEventListener("click", this._onClick as EventListener);
  }

  private _onClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-action]");
    if (!target || !this._hass || !this._config) return;
    const action = target.dataset.action;

    if (action === "alarm") {
      const service = target.dataset.service;
      const entity = this._config.security.alarm_entity;
      if (service && entity) this._hass.callService("alarm_control_panel", service, { entity_id: entity });
      return;
    }

    const cameras = this._config.security.cameras;
    if (action === "camera-select") {
      const index = Number(target.dataset.index);
      if (Number.isFinite(index)) {
        this._cameraIndex = index;
        this._render();
      }
      return;
    }
    if (action === "camera-prev" || action === "camera-next") {
      if (cameras.length === 0) return;
      const dir = action === "camera-prev" ? -1 : 1;
      this._cameraIndex = (this._cameraIndex + dir + cameras.length) % cameras.length;
      this._render();
      return;
    }
    if (action === "privacy-toggle") {
      const entity = target.dataset.entity;
      const service = target.dataset.service || "toggle";
      if (entity) this._hass.callService(entity.split(".")[0] ?? "", service, { entity_id: entity });
      return;
    }
  }

  private _render(): void {
    if (!this._config) return;
    const security = this._config.security;
    const alarmHtml = this._alarmHtml(security.alarm_entity);
    const cameraHtml = this._cameraHtml(security.cameras ?? []);
    if (!alarmHtml && !cameraHtml) {
      this.root.innerHTML = `<style>${CARD_CSS}</style>`;
      return;
    }
    this.root.innerHTML = `<style>${CARD_CSS}</style><ha-card class="jsc-shell">${alarmHtml}${cameraHtml}</ha-card>`;
  }

  private _alarmHtml(entityId: string | undefined): string {
    if (!entityId) return "";
    const state = entityState(this._hass, entityId);
    if (!state || isUnavailable(state.state)) return "";
    const label = ALARM_MODE_LABELS[state.state] || state.state;
    const armed = state.state.startsWith("armed") || state.state === "triggered";
    return `
      <div class="jsc-alarm">
        <div class="jsc-alarm-text">
          <span class="jsc-alarm-label">Alarm</span>
          <span class="jsc-alarm-status${armed ? " on" : ""}">${escapeHtml(label)}</span>
        </div>
        <div class="jsc-alarm-btns">
          <button data-action="alarm" data-service="alarm_disarm">Uit</button>
          <button data-action="alarm" data-service="alarm_arm_home">Thuis</button>
          <button data-action="alarm" data-service="alarm_arm_away">Afwezig</button>
        </div>
      </div>`;
  }

  private _cameraHtml(cameras: CameraConfig[]): string {
    if (cameras.length === 0) return "";
    const index = Math.min(this._cameraIndex, cameras.length - 1);
    const camera = cameras[index];
    if (!camera) return "";
    const state = entityState(this._hass, camera.camera_entity);
    const imageUrl = state?.attributes?.["entity_picture"];

    const otherRows = cameras
      .map((cam, camIndex) => (camIndex === index ? "" : this._cameraRowHtml(cam, camIndex)))
      .filter(Boolean)
      .join("");

    return `
      <div class="jsc-cam">
        <div class="jsc-cam-head">
          <span>${escapeHtml(camera.name)} &middot; ${index + 1} van ${cameras.length}</span>
          ${
            cameras.length > 1
              ? `<span class="jsc-cam-nav">
                  <button data-action="camera-prev" aria-label="Vorige camera">&lsaquo;</button>
                  <button data-action="camera-next" aria-label="Volgende camera">&rsaquo;</button>
                </span>`
              : ""
          }
        </div>
        <div class="jsc-cam-stage">
          ${
            typeof imageUrl === "string" && imageUrl
              ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(camera.name)}">`
              : `<div class="jsc-cam-empty">Geen beeld beschikbaar</div>`
          }
        </div>
        ${otherRows ? `<div class="jsc-cam-list">${otherRows}</div>` : ""}
      </div>`;
  }

  private _cameraRowHtml(camera: CameraConfig, index: number): string {
    const privacyState = camera.privacy_entity ? entityState(this._hass, camera.privacy_entity) : null;
    const privacyOn = privacyState?.state === "on";
    return `
      <button class="jsc-cam-item" data-action="camera-select" data-index="${index}">
        <span>${escapeHtml(camera.name)}</span>
        ${
          camera.privacy_entity
            ? `<span class="jsc-privacy${privacyOn ? " on" : ""}" data-action="privacy-toggle"
                 data-entity="${escapeHtml(camera.privacy_entity)}" data-service="${escapeHtml(camera.privacy_service || "toggle")}">
                 ${privacyOn ? "Privacy aan" : "Privacy uit"}
               </span>`
            : ""
        }
      </button>`;
  }
}

const CARD_CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jsc-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    overflow: hidden;
  }

  .jsc-alarm { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; flex-wrap: wrap; }
  .jsc-alarm-text { display: flex; flex-direction: column; gap: 2px; }
  .jsc-alarm-label { font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jsc-alarm-status { font-size: 14px; font-weight: 700; color: var(--juiced-status-ok, var(--state-active-color, #2e7d43)); }
  .jsc-alarm-status.on { color: var(--juiced-status-critical, var(--error-color, #c62828)); }
  .jsc-alarm-btns { display: flex; gap: 6px; }
  .jsc-alarm-btns button {
    border-radius: 999px; padding: 8px 14px; font: 600 12.5px/1 inherit; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-primary, var(--primary-text-color));
  }

  .jsc-cam { border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jsc-cam-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 10px; font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jsc-cam-nav { display: flex; gap: 6px; }
  .jsc-cam-nav button {
    width: 26px; height: 26px; border-radius: 999px; cursor: pointer; padding: 0; font-size: 15px; line-height: 1;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent); color: var(--juiced-text-secondary, var(--primary-text-color));
  }
  .jsc-cam-stage {
    margin: 0 14px 12px; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9;
    background: var(--juiced-surface-elevated, #0c1b28); display: flex; align-items: center; justify-content: center;
  }
  .jsc-cam-stage img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .jsc-cam-empty { color: var(--juiced-text-muted, var(--secondary-text-color)); font-size: 12px; }
  .jsc-cam-list { display: flex; flex-direction: column; padding: 0 14px 12px; gap: 6px; }
  .jsc-cam-item {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    border-radius: 10px; padding: 8px 10px; cursor: pointer; font: 600 12.5px/1 inherit;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent); color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jsc-privacy { font-size: 10.5px; font-weight: 600; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jsc-privacy.on { color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00)); }
`;

export function registerJuicedDashboardSecurityCard(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("juiced-dashboard-security-card")) {
    customElements.define("juiced-dashboard-security-card", JuicedDashboardSecurityCard);
  }
  if (typeof window !== "undefined") {
    window.customCards = window.customCards || [];
    if (!window.customCards.some((card) => card.type === "juiced-dashboard-security-card")) {
      window.customCards.push({
        type: "juiced-dashboard-security-card",
        name: "Juiced Dashboard — Security",
        description: "Alarmbediening en een doorbladerbare camerastrook, privacy enkel bij camera's die dat effectief hebben.",
        preview: false,
        documentationURL: "https://github.com/ju1ced/juiced-dashboard",
      });
    }
  }
}
