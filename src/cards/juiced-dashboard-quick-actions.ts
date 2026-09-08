/**
 * "Snelacties" — a small, curated row of cross-room actions (alarm, garage
 * door, "all lights off", ...) that don't need a room popup or a dashboard
 * navigation. Deliberately not a duplicate of every room's controls — see
 * this repo's Horizon Redesign roadmap for why that distinction matters.
 */

import { entityState, escapeHtml, isUnavailable } from "./juiced-dashboard-room-card";
import type { HomeAssistant } from "./juiced-dashboard-room-card";
import type { QuickActionConfig } from "../config/types";

export interface JuicedDashboardQuickActionsConfig {
  type: "custom:juiced-dashboard-quick-actions";
  actions: QuickActionConfig[];
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

const ICON_BOLT =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Domains whose state meaningfully reads as "on"/"off" — used to give the chip a toggled look. */
const TOGGLEABLE_ON_STATES = new Set(["on", "open", "armed_home", "armed_away", "armed_night", "playing", "heat", "cool"]);

function domainOf(entityId: string): string {
  return entityId.split(".")[0] ?? "";
}

export class JuicedDashboardQuickActions extends HTMLElementBase {
  private _config: JuicedDashboardQuickActionsConfig | null = null;
  private _hass: HomeAssistant | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onClick = this._onClick.bind(this);
  }

  private get root(): ShadowRoot {
    return this.shadowRoot as ShadowRoot;
  }

  static getStubConfig(): JuicedDashboardQuickActionsConfig {
    return { type: "custom:juiced-dashboard-quick-actions", actions: [] };
  }

  setConfig(config: JuicedDashboardQuickActionsConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("juiced-dashboard-quick-actions: invalid configuration.");
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
    return 1;
  }

  connectedCallback(): void {
    this.root.addEventListener("click", this._onClick as EventListener);
  }

  disconnectedCallback(): void {
    this.root.removeEventListener("click", this._onClick as EventListener);
  }

  private _onClick(event: MouseEvent): void {
    const origin = event.target as HTMLElement | null;
    const target = origin?.closest<HTMLElement>("[data-entity]");
    if (!target || !this._hass) return;
    const entity = target.dataset.entity;
    const service = target.dataset.service;
    if (!entity || !service) return;
    this._hass.callService(domainOf(entity), service, { entity_id: entity });
  }

  private _render(): void {
    if (!this._config) return;
    const actions = this._config.actions ?? [];
    const hass = this._hass;

    if (actions.length === 0) {
      this.root.innerHTML = `<style>${CARD_CSS}</style>`;
      return;
    }

    const chips = actions
      .map((action) => {
        const state = entityState(hass, action.entity);
        const unavailable = isUnavailable(state?.state);
        const on = Boolean(state && TOGGLEABLE_ON_STATES.has(state.state));
        return `
          <button class="jqa-chip${on ? " on" : ""}" data-entity="${escapeHtml(action.entity)}" data-service="${escapeHtml(action.service)}" ${unavailable ? "disabled" : ""}>
            <span class="jqa-ic">${ICON_BOLT}</span>
            <span class="jqa-label">${escapeHtml(action.label)}</span>
          </button>`;
      })
      .join("");

    this.root.innerHTML = `<style>${CARD_CSS}</style><div class="jqa-row">${chips}</div>`;
  }
}

const CARD_CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  .jqa-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .jqa-chip {
    display: flex; align-items: center; gap: 9px; border-radius: 999px; cursor: pointer;
    padding: 10px 16px 10px 12px; font: 600 13px/1 inherit;
    background: var(--juiced-surface-raised, var(--card-background-color, #fff));
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    color: var(--juiced-text-primary, var(--primary-text-color));
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,.08));
  }
  .jqa-chip:disabled { opacity: .5; cursor: default; }
  .jqa-ic {
    width: 28px; height: 28px; border-radius: 9px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jqa-chip.on .jqa-ic {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
  }
`;

export function registerJuicedDashboardQuickActions(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("juiced-dashboard-quick-actions")) {
    customElements.define("juiced-dashboard-quick-actions", JuicedDashboardQuickActions);
  }
  if (typeof window !== "undefined") {
    window.customCards = window.customCards || [];
    if (!window.customCards.some((card) => card.type === "juiced-dashboard-quick-actions")) {
      window.customCards.push({
        type: "juiced-dashboard-quick-actions",
        name: "Juiced Dashboard — Snelacties",
        description: "Een kleine, gecureerde rij kruis-kamer acties (alarm, garagepoort, ...).",
        preview: false,
        documentationURL: "https://github.com/ju1ced/juiced-dashboard",
      });
    }
  }
}
