/**
 * Juiced Dashboard Room Card
 * A self-contained Home Assistant Lovelace card: a compact list of rooms
 * where tapping a row opens a popup with just what's controllable in that
 * room — lights, covers, awnings, media, climate — no navigation, no
 * per-room dashboard page required. A category with nothing configured for
 * a room is simply omitted from its popup.
 *
 * Lovelace type: custom:juiced-dashboard-room-card
 *
 * TypeScript port of `ju1ced/juiced-room-card` v0.1.0 (same author, same
 * MIT license) — ported here so the card ships from `juiced-dashboard`'s
 * own HACS packaging instead of a separate repo. Logic and behavior are
 * unchanged; only types were added and the custom element was renamed to
 * match this repo's card-family prefix.
 *
 * The pure helper functions carry no DOM/`window` dependency so they can be
 * unit-tested directly under Node (see test/). Colors read the
 * `juiced-horizon` theme tokens first and fall back to core Home Assistant
 * variables, so the card looks native under any theme.
 */

/* ------------------------------------------------------------------ *
 * Home Assistant types (minimal — no @types/home-assistant dependency)
 * ------------------------------------------------------------------ */

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
  last_updated?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(domain: string, service: string, serviceData?: Record<string, unknown>): void;
}

/* ------------------------------------------------------------------ *
 * Card config types
 * ------------------------------------------------------------------ */

export interface RoomLightConfig {
  entity: string;
  name?: string;
}

export interface RoomCoverConfig {
  entity: string;
  name?: string;
}

export interface RoomConfig {
  name: string;
  icon?: string;
  temperature?: string;
  humidity?: string;
  idle_text?: string;
  lights?: RoomLightConfig[];
  covers?: RoomCoverConfig[];
  awnings?: RoomCoverConfig[];
  media_player?: string;
  climate?: string;
}

export interface JuicedDashboardRoomCardConfig {
  type: string;
  title?: string;
  subtitle?: string;
  rooms: RoomConfig[];
}

/* ------------------------------------------------------------------ *
 * Pure helpers (no DOM/window dependency — unit-tested under Node)
 * ------------------------------------------------------------------ */

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const UNAVAILABLE_STATES = new Set(["unavailable", "unknown"]);

export function isUnavailable(state: string | undefined | null): boolean {
  return state === undefined || state === null || UNAVAILABLE_STATES.has(state);
}

export function entityState(hass: HomeAssistant | null | undefined, entityId: string | undefined | null): HassEntity | null {
  if (!entityId || !hass) return null;
  return hass.states?.[entityId] || null;
}

export function formatNumber(value: unknown, decimals?: number): string | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n.toFixed(decimals ?? 1).replace(".", ",");
}

export function formatTemp(value: unknown, decimals?: number): string | null {
  const formatted = formatNumber(value, decimals);
  return formatted === null ? null : `${formatted}°`;
}

const HVAC_MODE_LABELS: Record<string, string> = {
  off: "Uit",
  heat: "Verwarmen",
  cool: "Koelen",
  heat_cool: "Auto",
  auto: "Auto",
  fan_only: "Ventilator",
  dry: "Droog",
};

export function humanize(key: unknown): string {
  const text = String(key ?? "").replace(/_/g, " ");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

export function hvacModeLabel(mode: string | undefined | null): string {
  if (!mode) return "Onbekend";
  return HVAC_MODE_LABELS[mode] || humanize(mode) || "Onbekend";
}

/** Cover position 0-100, or null when unknown. */
export function coverPosition(stateObj: HassEntity | null): number | null {
  if (!stateObj) return null;
  const attrPos = stateObj.attributes?.["current_position"];
  if (typeof attrPos === "number" && Number.isFinite(attrPos)) return Math.round(attrPos);
  if (stateObj.state === "open") return 100;
  if (stateObj.state === "closed") return 0;
  return null;
}

export function coverPositionLabel(stateObj: HassEntity | null): string {
  const pos = coverPosition(stateObj);
  return pos === null ? "—" : `${pos}%`;
}

export function displayName(configured: string | undefined | null, stateObj: HassEntity | null, fallback: string | undefined | null): string {
  if (configured) return configured;
  const friendly = stateObj?.attributes?.["friendly_name"];
  if (typeof friendly === "string" && friendly) return friendly;
  return fallback || "";
}

/** Every distinct entity id referenced anywhere in one room's config. */
export function roomEntityIds(room: RoomConfig | undefined | null): string[] {
  const ids: string[] = [];
  const add = (id: unknown) => {
    if (typeof id === "string" && id.includes(".")) ids.push(id);
  };
  add(room?.temperature);
  add(room?.humidity);
  add(room?.media_player);
  add(room?.climate);
  (room?.lights || []).forEach((l) => add(l?.entity));
  (room?.covers || []).forEach((c) => add(c?.entity));
  (room?.awnings || []).forEach((a) => add(a?.entity));
  return ids;
}

/** Every distinct entity id referenced anywhere in a card config. */
export function collectEntityIds(config: Pick<JuicedDashboardRoomCardConfig, "rooms"> | undefined | null): string[] {
  const ids = new Set<string>();
  (config?.rooms || []).forEach((room) => {
    roomEntityIds(room).forEach((id) => ids.add(id));
  });
  return [...ids];
}

/**
 * True when any tracked entity's state or last_updated changed between two
 * hass objects. Used to skip needless full re-renders on unrelated ticks.
 */
export function hasRelevantChange(prevHass: HomeAssistant | null, nextHass: HomeAssistant | null, entityIds: string[]): boolean {
  if (!prevHass || !nextHass) return true;
  const prev = prevHass.states || {};
  const next = nextHass.states || {};
  for (const id of entityIds) {
    const a = prev[id];
    const b = next[id];
    if (!a || !b) {
      if (a !== b) return true;
      continue;
    }
    if (a.state !== b.state) return true;
    if (a.last_updated !== b.last_updated) return true;
  }
  return false;
}

/** Compact "24,4° · 41%" stat line for a room row, from its sensors. */
export function roomStatLine(hass: HomeAssistant | null | undefined, room: RoomConfig): string {
  const parts: string[] = [];
  const tempObj = entityState(hass, room?.temperature);
  if (tempObj && !isUnavailable(tempObj.state)) {
    const t = formatTemp(tempObj.state, 1);
    if (t) parts.push(t);
  }
  const humObj = entityState(hass, room?.humidity);
  if (humObj && !isUnavailable(humObj.state)) {
    const h = formatNumber(humObj.state, 0);
    if (h) parts.push(`${h}%`);
  }
  if (parts.length) return parts.join(" · ");
  return room?.idle_text || "Rustig";
}

/** Number of a room's configured lights currently on. */
export function roomLightsOn(hass: HomeAssistant | null | undefined, room: RoomConfig): number {
  return (room?.lights || []).filter((l) => entityState(hass, l?.entity)?.state === "on").length;
}

/** Small badge text for a room row, or null when nothing is worth flagging. */
export function roomFlag(hass: HomeAssistant | null | undefined, room: RoomConfig): string | null {
  const on = roomLightsOn(hass, room);
  if (on <= 0) return null;
  return on === 1 ? "1 lamp aan" : `${on} lampen aan`;
}

/** True when a room has at least one populated control category. */
export function roomHasControls(room: RoomConfig | undefined | null): boolean {
  return Boolean(
    (room?.lights || []).length ||
      (room?.covers || []).length ||
      (room?.awnings || []).length ||
      room?.media_player ||
      room?.climate,
  );
}

/* ------------------------------------------------------------------ *
 * Service-call actions (impure — need `hass`)
 * ------------------------------------------------------------------ */

function callService(hass: HomeAssistant | null | undefined, domain: string, service: string, entityId: string | undefined | null, extra?: Record<string, unknown>): void {
  if (!hass || !entityId) return;
  hass.callService(domain, service, { entity_id: entityId, ...(extra || {}) });
}

export function toggleLight(hass: HomeAssistant | null | undefined, entityId: string | undefined | null): void {
  callService(hass, "light", "toggle", entityId);
}
export function openCover(hass: HomeAssistant | null | undefined, entityId: string | undefined | null): void {
  callService(hass, "cover", "open_cover", entityId);
}
export function closeCover(hass: HomeAssistant | null | undefined, entityId: string | undefined | null): void {
  callService(hass, "cover", "close_cover", entityId);
}
export function stopCover(hass: HomeAssistant | null | undefined, entityId: string | undefined | null): void {
  callService(hass, "cover", "stop_cover", entityId);
}
export function setHvacMode(hass: HomeAssistant | null | undefined, entityId: string | undefined | null, mode: string | undefined | null): void {
  callService(hass, "climate", "set_hvac_mode", entityId, { hvac_mode: mode });
}

/** Default target used when a climate entity reports no current temperature attribute. */
export const DEFAULT_CLIMATE_TARGET = 20;

export function stepClimateTarget(hass: HomeAssistant | null | undefined, entityId: string | undefined | null, currentTarget: unknown, step: number): void {
  const hasValue = currentTarget !== "" && currentTarget !== null && currentTarget !== undefined;
  const parsed = hasValue ? Number(currentTarget) : NaN;
  const base = Number.isFinite(parsed) ? parsed : DEFAULT_CLIMATE_TARGET;
  const next = Math.round((base + step) * 10) / 10;
  callService(hass, "climate", "set_temperature", entityId, { temperature: next });
}
export function toggleMediaPlayPause(hass: HomeAssistant | null | undefined, entityId: string | undefined | null): void {
  callService(hass, "media_player", "media_play_pause", entityId);
}

/* ------------------------------------------------------------------ *
 * The custom element
 * ------------------------------------------------------------------ */

// In the browser this is the real HTMLElement; under Node (unit tests) the
// class body is never instantiated, so a plain base keeps `require`/`import`
// working without a DOM.
const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

export class JuicedDashboardRoomCard extends HTMLElementBase {
  private _config: JuicedDashboardRoomCardConfig | null = null;
  private _hass: HomeAssistant | null = null;
  private _entityIds: string[] = [];
  private _openRoomIndex: number | null = null;
  private _built = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onDocKeydown = this._onDocKeydown.bind(this);
  }

  private get root(): ShadowRoot {
    return this.shadowRoot as ShadowRoot;
  }

  static getStubConfig(): JuicedDashboardRoomCardConfig {
    return {
      type: "custom:juiced-dashboard-room-card",
      title: "Kamers",
      subtitle: "Tik een kamer om lichten, rolluiken, luifels, radio of airco direct te bedienen",
      rooms: [
        {
          name: "Bureau",
          icon: "mdi:desk",
          temperature: "sensor.bureau_temperature",
          humidity: "sensor.bureau_humidity",
          lights: [
            { entity: "light.bureau_spellenruimte", name: "Bureau & spellenruimte" },
            { entity: "light.bureau_spellentafel", name: "Spellentafel" },
          ],
          awnings: [{ entity: "cover.luifel_bureau", name: "Luifel bureau" }],
          media_player: "media_player.kantoor",
          climate: "climate.daikin_bureau",
        },
      ],
    };
  }

  setConfig(config: JuicedDashboardRoomCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("juiced-dashboard-room-card: invalid configuration.");
    }
    if (!Array.isArray(config.rooms)) {
      throw new Error("juiced-dashboard-room-card: `rooms` must be a list.");
    }
    config.rooms.forEach((room, index) => {
      if (!room || typeof room !== "object") {
        throw new Error(`juiced-dashboard-room-card: room at index ${index} must be an object.`);
      }
      if (!room.name) {
        throw new Error(`juiced-dashboard-room-card: room at index ${index} is missing \`name\`.`);
      }
    });
    this._config = config;
    this._entityIds = collectEntityIds(config);
    this._openRoomIndex = null;
    this._built = false;
    this._renderShell();
    this._renderList();
    this._built = true;
  }

  set hass(hass: HomeAssistant) {
    const prev = this._hass;
    this._hass = hass;
    if (!this._config) return;
    if (this._built && prev && !hasRelevantChange(prev, hass, this._entityIds)) return;
    this._renderList();
    if (this._openRoomIndex !== null) this._renderPopup();
  }

  get hass(): HomeAssistant | null {
    return this._hass;
  }

  getCardSize(): number {
    return 1 + Math.ceil((this._config?.rooms?.length || 0) / 2);
  }

  connectedCallback(): void {
    this.root.addEventListener("click", this._onClick as EventListener);
    this.root.addEventListener("keydown", this._onKeydown as EventListener);
  }

  disconnectedCallback(): void {
    this.root.removeEventListener("click", this._onClick as EventListener);
    this.root.removeEventListener("keydown", this._onKeydown as EventListener);
    if (typeof document !== "undefined") document.removeEventListener("keydown", this._onDocKeydown as EventListener);
  }

  /* ---- static shell: header + list container + popup skeleton ---- */

  private _renderShell(): void {
    const c = this._config || ({} as JuicedDashboardRoomCardConfig);
    this.root.innerHTML = `
      <style>${CARD_CSS}</style>
      <ha-card class="jrc-shell">
        ${
          c.title || c.subtitle
            ? `<div class="jrc-head">
                ${c.title ? `<h2 class="jrc-title">${escapeHtml(c.title)}</h2>` : ""}
                ${c.subtitle ? `<p class="jrc-subtitle">${escapeHtml(c.subtitle)}</p>` : ""}
              </div>`
            : ""
        }
        <div class="jrc-list" id="list"></div>
      </ha-card>
      <div class="jrc-backdrop" id="backdrop" data-action="close-backdrop">
        <div class="jrc-popup" role="dialog" aria-modal="true" aria-labelledby="popup-name">
          <div class="jrc-popup-head">
            <span class="jrc-room-ic" id="popup-icon"></span>
            <div class="jrc-popup-heading">
              <h3 id="popup-name"></h3>
              <div class="jrc-popup-sub" id="popup-sub"></div>
            </div>
            <button class="jrc-close" data-action="close" aria-label="Sluiten">${ICON_CLOSE}</button>
          </div>
          <div class="jrc-popup-body" id="popup-body"></div>
        </div>
      </div>`;
  }

  /* ---- room list (cheap, safe to rebuild on every relevant tick) ---- */

  private _renderList(): void {
    const list = this.root.getElementById("list");
    if (!list) return;
    const hass = this._hass;
    const rooms = this._config?.rooms || [];
    list.innerHTML = rooms.map((room, index) => this._roomRowHtml(room, index, hass)).join("");
  }

  private _roomRowHtml(room: RoomConfig, index: number, hass: HomeAssistant | null): string {
    const stat = roomStatLine(hass, room);
    const flag = roomFlag(hass, room);
    const firstLight = (room.lights || [])[0];
    const firstLightOn = firstLight ? entityState(hass, firstLight.entity)?.state === "on" : false;
    return `
      <div class="jrc-row" role="button" tabindex="0" data-action="open-room" data-room="${index}">
        <span class="jrc-row-ic">${roomIconSvg(room.icon)}</span>
        <span class="jrc-row-text">
          <span class="jrc-row-name">${escapeHtml(room.name)}</span>
          <span class="jrc-row-stat">${escapeHtml(stat)}</span>
        </span>
        ${flag ? `<span class="jrc-flag">${escapeHtml(flag)}</span>` : ""}
        ${
          firstLight
            ? `<button class="jrc-quick${firstLightOn ? " on" : ""}" data-action="toggle-light"
                 data-entity="${escapeHtml(firstLight.entity)}"
                 aria-label="Licht ${escapeHtml(room.name)} omschakelen" title="Licht omschakelen">${ICON_BULB}</button>`
            : `<span class="jrc-chev">${ICON_CHEVRON}</span>`
        }
      </div>`;
  }

  /* ---- popup ---- */

  private _openRoom(index: number): void {
    const rooms = this._config?.rooms || [];
    if (!rooms[index]) return;
    this._openRoomIndex = index;
    this._renderPopup();
    const backdrop = this.root.getElementById("backdrop");
    backdrop?.classList.add("show");
    if (typeof document !== "undefined") document.addEventListener("keydown", this._onDocKeydown as EventListener);
  }

  private _closePopup(): void {
    this._openRoomIndex = null;
    const backdrop = this.root.getElementById("backdrop");
    backdrop?.classList.remove("show");
    if (typeof document !== "undefined") document.removeEventListener("keydown", this._onDocKeydown as EventListener);
  }

  private _renderPopup(): void {
    const room = (this._config?.rooms || [])[this._openRoomIndex as number];
    if (!room) return;
    const hass = this._hass;

    const iconEl = this.root.getElementById("popup-icon");
    if (iconEl) iconEl.innerHTML = roomIconSvg(room.icon);
    const nameEl = this.root.getElementById("popup-name");
    if (nameEl) nameEl.textContent = room.name;
    const subEl = this.root.getElementById("popup-sub");
    if (subEl) subEl.textContent = roomStatLine(hass, room);

    const sections = [
      this._sectionLights(hass, room),
      this._sectionCovers(hass, room, "covers", "Rolluiken"),
      this._sectionCovers(hass, room, "awnings", "Luifels"),
      this._sectionMedia(hass, room),
      this._sectionClimate(hass, room),
    ]
      .filter(Boolean)
      .join("");

    const body = this.root.getElementById("popup-body");
    if (body) {
      body.innerHTML = sections || `<p class="jrc-empty">Geen snelbediening geconfigureerd voor deze kamer.</p>`;
    }
  }

  private _sectionLights(hass: HomeAssistant | null, room: RoomConfig): string {
    const lights = room.lights || [];
    if (!lights.length) return "";
    const rows = lights
      .map((l) => {
        const stateObj = entityState(hass, l.entity);
        const on = stateObj?.state === "on";
        const name = displayName(l.name, stateObj, l.entity);
        const unavailable = isUnavailable(stateObj?.state);
        return `
          <div class="jrc-lightrow${on ? " on" : ""}">
            <span class="jrc-lrow-ic">${ICON_BULB}</span>
            <span class="jrc-lrow-text">
              <span class="jrc-lrow-name">${escapeHtml(name)}</span>
              <span class="jrc-lrow-sub">${unavailable ? "Niet beschikbaar" : on ? "Aan" : "Uit"}</span>
            </span>
            <button class="jrc-toggle${on ? " on" : ""}" data-action="toggle-light"
              data-entity="${escapeHtml(l.entity)}" ${unavailable ? "disabled" : ""}
              aria-label="${escapeHtml(name)} omschakelen"><i></i></button>
          </div>`;
      })
      .join("");
    return `<div class="jrc-section"><h4>Verlichting</h4>${rows}</div>`;
  }

  private _sectionCovers(hass: HomeAssistant | null, room: RoomConfig, key: "covers" | "awnings", title: string): string {
    const items = room[key] || [];
    if (!items.length) return "";
    const rows = items
      .map((c) => {
        const stateObj = entityState(hass, c.entity);
        const name = displayName(c.name, stateObj, c.entity);
        return `
          <div class="jrc-coverrow">
            <span class="jrc-cr-name">${escapeHtml(name)}</span>
            <span class="jrc-cr-pos">${coverPositionLabel(stateObj)}</span>
            <span class="jrc-cr-btns">
              <button data-action="cover-open" data-entity="${escapeHtml(c.entity)}" aria-label="Omhoog">${ICON_CARET_UP}</button>
              <button data-action="cover-stop" data-entity="${escapeHtml(c.entity)}" aria-label="Stop">${ICON_STOP}</button>
              <button data-action="cover-close" data-entity="${escapeHtml(c.entity)}" aria-label="Omlaag">${ICON_CARET_DOWN}</button>
            </span>
          </div>`;
      })
      .join("");
    return `<div class="jrc-section"><h4>${escapeHtml(title)}</h4>${rows}</div>`;
  }

  private _sectionMedia(hass: HomeAssistant | null, room: RoomConfig): string {
    if (!room.media_player) return "";
    const stateObj = entityState(hass, room.media_player);
    const name = displayName(null, stateObj, room.media_player);
    const mediaTitle = stateObj?.attributes?.["media_title"];
    const track = typeof mediaTitle === "string" && mediaTitle ? mediaTitle : isUnavailable(stateObj?.state) ? "Niet beschikbaar" : "Uit";
    const playing = stateObj?.state === "playing";
    return `
      <div class="jrc-section">
        <h4>Media</h4>
        <div class="jrc-media">
          <span class="jrc-media-ic">${ICON_SPEAKER}</span>
          <span class="jrc-media-text">
            <span class="jrc-media-name">${escapeHtml(name)}</span>
            <span class="jrc-media-sub">${escapeHtml(track)}</span>
          </span>
          <button class="jrc-media-btn${playing ? " on" : ""}" data-action="media-toggle"
            data-entity="${escapeHtml(room.media_player)}" aria-label="Afspelen/pauzeren">${ICON_PLAY}</button>
        </div>
      </div>`;
  }

  private _sectionClimate(hass: HomeAssistant | null, room: RoomConfig): string {
    if (!room.climate) return "";
    const stateObj = entityState(hass, room.climate);
    const name = displayName(null, stateObj, room.climate);
    const rawModes = stateObj?.attributes?.["hvac_modes"];
    const modes = Array.isArray(rawModes) ? (rawModes.filter((m): m is string => typeof m === "string")) : [];
    const currentMode = stateObj?.state;
    const current = formatTemp(stateObj?.attributes?.["current_temperature"], 1);
    const target = stateObj?.attributes?.["temperature"];
    const targetLabel = formatTemp(target, 1) || "—";
    const rawStep = Number(stateObj?.attributes?.["target_temp_step"]);
    const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 0.5;

    const modeButtons = modes
      .map(
        (mode) => `
        <button class="jrc-pill${mode === currentMode ? " on" : ""}" data-action="climate-mode"
          data-entity="${escapeHtml(room.climate)}" data-mode="${escapeHtml(mode)}">${escapeHtml(hvacModeLabel(mode))}</button>`,
      )
      .join("");

    const targetAttr = typeof target === "string" || typeof target === "number" ? String(target) : "";

    return `
      <div class="jrc-section">
        <h4>Klimaat</h4>
        <div class="jrc-kv"><span>${escapeHtml(name)}</span><span class="ok">${escapeHtml(hvacModeLabel(currentMode))}</span></div>
        ${modeButtons ? `<div class="jrc-pillrow">${modeButtons}</div>` : ""}
        <div class="jrc-stepper">
          <button data-action="climate-step" data-entity="${escapeHtml(room.climate)}"
            data-target="${targetAttr}" data-step="${-step}" aria-label="Kouder">−</button>
          <div class="jrc-stepper-mid">
            <div class="v">${escapeHtml(targetLabel)}</div>
            <div class="l">doel${current ? ` · nu ${escapeHtml(current)}` : ""}</div>
          </div>
          <button data-action="climate-step" data-entity="${escapeHtml(room.climate)}"
            data-target="${targetAttr}" data-step="${step}" aria-label="Warmer">+</button>
        </div>
      </div>`;
  }

  /* ---- event delegation ---- */

  private _onClick(event: MouseEvent): void {
    const origin = event.target as HTMLElement | null;
    const target = origin?.closest<HTMLElement>("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const hass = this._hass;

    if (action === "open-room") {
      this._openRoom(Number(target.dataset.room));
      return;
    }
    if (action === "close" || action === "close-backdrop") {
      if (action === "close-backdrop" && event.target !== target) return;
      this._closePopup();
      return;
    }
    if (action === "toggle-light") {
      event.stopPropagation();
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

  private _onKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    const origin = event.target as HTMLElement | null;
    const row = origin?.closest<HTMLElement>('[data-action="open-room"]');
    if (!row) return;
    event.preventDefault();
    this._openRoom(Number(row.dataset.room));
  }

  private _onDocKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") this._closePopup();
  }
}

/* ------------------------------------------------------------------ *
 * Tiny inline icon set (stroke-based, matches the juiced-horizon look)
 * ------------------------------------------------------------------ */

const ICON_BULB =
  '<svg viewBox="0 0 24 24" width="16" height="16"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.4 10.9c.5.5.9 1.2 1 2h4.8c.1-.8.5-1.5 1-2A6 6 0 0 0 12 3z"/></g></svg>';
const ICON_CHEVRON =
  '<svg viewBox="0 0 24 24" width="15" height="15"><polyline points="9 6 15 12 9 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" width="15" height="15"><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></g></svg>';
const ICON_CARET_UP =
  '<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 15 12 9 18 15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_CARET_DOWN =
  '<svg viewBox="0 0 24 24" width="14" height="14"><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_STOP = '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>';
const ICON_SPEAKER =
  '<svg viewBox="0 0 24 24" width="18" height="18"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="8.2" r="2.4"/><circle cx="12" cy="16.5" r="1.1"/></g></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" width="13" height="13"><polygon points="6 4 20 12 6 20" fill="currentColor"/></svg>';
const ICON_ROOM_DEFAULT =
  '<svg viewBox="0 0 24 24" width="17" height="17"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></g></svg>';

/** MDI-style `mdi:xxx` icon config renders via `<ha-icon>`; anything else falls back to a generic room glyph. */
export function roomIconSvg(icon: string | undefined | null): string {
  if (typeof icon === "string" && icon.startsWith("mdi:")) {
    return `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>`;
  }
  return ICON_ROOM_DEFAULT;
}

/* ------------------------------------------------------------------ *
 * Card CSS — juiced-horizon tokens first, core HA variables as fallback
 * ------------------------------------------------------------------ */

const CARD_CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  ha-card.jrc-shell {
    background: var(--juiced-surface-raised, var(--ha-card-background, var(--card-background-color, #fff)));
    border-radius: var(--juiced-radius-lg, var(--ha-card-border-radius, 16px));
    overflow: hidden;
  }
  .jrc-head { padding: 16px 18px 4px; }
  .jrc-title {
    margin: 0; font-size: 16px; font-weight: 700;
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrc-subtitle {
    margin: 3px 0 0; font-size: 12.5px;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }
  .jrc-list { display: flex; flex-direction: column; }
  .jrc-row {
    display: flex; align-items: center; gap: 13px; padding: 13px 18px;
    border-top: 1px solid var(--juiced-border-subtle, var(--divider-color));
    cursor: pointer; -webkit-tap-highlight-color: transparent;
  }
  .jrc-list .jrc-row:first-child { border-top: 0; }
  .jrc-row:hover, .jrc-row:focus-visible {
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.03)));
  }
  .jrc-row:focus-visible { outline: 2px solid var(--juiced-brand-primary, var(--primary-color)); outline-offset: -2px; }
  .jrc-row-ic {
    width: 36px; height: 36px; border-radius: 11px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-brand-primary, var(--primary-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-row-ic ha-icon { --mdc-icon-size: 18px; }
  .jrc-row-text { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
  .jrc-row-name {
    font-weight: 700; font-size: 13.5px;
    color: var(--juiced-text-primary, var(--primary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jrc-row-stat { font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 1px; }
  .jrc-flag {
    margin-left: auto; font-size: 10.5px; font-weight: 600; flex: none;
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    padding: 4px 8px; border-radius: 999px;
  }
  .jrc-chev { margin-left: auto; color: var(--juiced-text-muted, var(--secondary-text-color)); flex: none; display:flex; }
  .jrc-quick {
    margin-left: auto; flex: none; width: 32px; height: 32px; border-radius: 10px;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
  }
  .jrc-quick.on {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
    border-color: transparent;
  }

  .jrc-backdrop {
    position: fixed; inset: 0; z-index: 500; display: none;
    align-items: flex-end; justify-content: center;
    background: rgba(10,12,16,.5);
  }
  .jrc-backdrop.show { display: flex; }
  @media (min-width: 720px) { .jrc-backdrop { align-items: center; padding: 24px; } }
  .jrc-popup {
    width: 100%; max-width: 440px; max-height: 86vh; overflow-y: auto;
    background: var(--juiced-surface-raised, var(--card-background-color, #fff));
    border-radius: 22px 22px 0 0;
    box-shadow: 0 -12px 40px rgba(0,0,0,.28);
  }
  @media (min-width: 720px) { .jrc-popup { border-radius: var(--juiced-radius-lg, 20px); } }
  .jrc-popup-head {
    display: flex; align-items: center; gap: 12px; padding: 18px 20px 14px;
    position: sticky; top: 0; background: inherit;
    border-bottom: 1px solid var(--juiced-border-subtle, var(--divider-color));
  }
  .jrc-room-ic {
    width: 38px; height: 38px; border-radius: 12px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-brand-primary, var(--primary-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-room-ic ha-icon { --mdc-icon-size: 19px; }
  .jrc-popup-heading h3 {
    margin: 0; font-size: 15.5px; font-weight: 800;
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrc-popup-sub { font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color)); margin-top: 1px; }
  .jrc-close {
    margin-left: auto; width: 32px; height: 32px; border-radius: 999px; flex: none;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent);
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
  }
  .jrc-popup-body { padding: 4px 20px 18px; }
  .jrc-section { padding: 14px 0; border-top: 1px solid var(--juiced-border-subtle, var(--divider-color)); }
  .jrc-popup-body .jrc-section:first-child { border-top: 0; }
  .jrc-section h4 {
    margin: 0 0 8px; font-size: 11.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
    color: var(--juiced-text-muted, var(--secondary-text-color));
  }
  .jrc-empty { color: var(--juiced-text-muted, var(--secondary-text-color)); font-size: 12.5px; padding: 10px 0; }

  .jrc-lightrow { display: flex; align-items: center; gap: 11px; padding: 8px 0; }
  .jrc-lrow-ic {
    width: 32px; height: 32px; border-radius: 9px; flex: none;
    background: var(--juiced-surface-elevated, var(--secondary-background-color, rgba(0,0,0,.05)));
    color: var(--juiced-text-muted, var(--secondary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-lightrow.on .jrc-lrow-ic {
    background: var(--juiced-chip-active, rgba(178,106,0,.14));
    color: var(--juiced-brand-accent, var(--state-icon-active-color, #b26a00));
  }
  .jrc-lrow-text { display: flex; flex-direction: column; line-height: 1.25; }
  .jrc-lrow-name { font-weight: 600; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-lrow-sub { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
  .jrc-toggle {
    margin-left: auto; width: 40px; height: 24px; border-radius: 99px; position: relative; flex: none; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
  }
  .jrc-toggle i {
    position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 99px;
    background: var(--juiced-surface-raised, #fff); box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: left .15s ease;
  }
  .jrc-toggle.on { background: var(--juiced-brand-primary, var(--primary-color)); border-color: transparent; }
  .jrc-toggle.on i { left: 18px; background: var(--juiced-text-inverse, #fff); }
  .jrc-toggle:disabled { opacity: .5; cursor: default; }

  .jrc-coverrow { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
  .jrc-cr-name { font-size: 13px; font-weight: 600; flex: 1; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-cr-pos { font-size: 12px; color: var(--juiced-text-muted, var(--secondary-text-color)); width: 34px; text-align: right; }
  .jrc-cr-btns { display: flex; gap: 4px; }
  .jrc-cr-btns button {
    width: 28px; height: 28px; border-radius: 8px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }

  .jrc-media { display: flex; align-items: center; gap: 12px; }
  .jrc-media-ic {
    width: 40px; height: 40px; border-radius: 12px; flex: none; color: #fff;
    background: linear-gradient(155deg, var(--juiced-brand-primary, var(--primary-color)), var(--juiced-brand-secondary, var(--accent-color, #7ee787)));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-media-text { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .jrc-media-name { font-weight: 700; font-size: 13px; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-media-sub {
    font-size: 11.5px; color: var(--juiced-text-muted, var(--secondary-text-color));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jrc-media-btn {
    margin-left: auto; width: 34px; height: 34px; border-radius: 999px; flex: none; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, transparent);
    color: var(--juiced-text-secondary, var(--primary-text-color));
    display: flex; align-items: center; justify-content: center;
  }
  .jrc-media-btn.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }

  .jrc-kv { display: flex; justify-content: space-between; font-size: 13px; padding-bottom: 10px; }
  .jrc-kv span:first-child { color: var(--juiced-text-secondary, var(--primary-text-color)); }
  .jrc-kv .ok { font-weight: 700; color: var(--juiced-status-ok, var(--state-active-color, #2e7d43)); }
  .jrc-pillrow { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .jrc-pill {
    border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-secondary, var(--primary-text-color));
  }
  .jrc-pill.on { background: var(--juiced-brand-primary, var(--primary-color)); color: #fff; border-color: transparent; }
  .jrc-stepper { display: flex; align-items: center; justify-content: center; gap: 18px; }
  .jrc-stepper button {
    width: 34px; height: 34px; border-radius: 999px; font-size: 16px; cursor: pointer; padding: 0;
    border: 1px solid var(--juiced-border-subtle, var(--divider-color));
    background: var(--juiced-surface-elevated, var(--secondary-background-color, transparent));
    color: var(--juiced-text-primary, var(--primary-text-color));
  }
  .jrc-stepper-mid { text-align: center; }
  .jrc-stepper-mid .v { font-size: 26px; font-weight: 800; color: var(--juiced-text-primary, var(--primary-text-color)); }
  .jrc-stepper-mid .l { font-size: 11px; color: var(--juiced-text-muted, var(--secondary-text-color)); }
`;

/* ------------------------------------------------------------------ *
 * Registration (guarded against double definition)
 * ------------------------------------------------------------------ */

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

export function registerJuicedDashboardRoomCard(): void {
  if (typeof customElements !== "undefined") {
    if (!customElements.get("juiced-dashboard-room-card")) {
      customElements.define("juiced-dashboard-room-card", JuicedDashboardRoomCard);
    }
  }

  if (typeof window !== "undefined") {
    window.customCards = window.customCards || [];
    if (!window.customCards.some((card) => card.type === "juiced-dashboard-room-card")) {
      window.customCards.push({
        type: "juiced-dashboard-room-card",
        name: "Juiced Dashboard Room Card",
        description:
          "Tik een kamer, krijg een popup met enkel wat daar bedienbaar is — lichten, rolluiken, luifels, radio, airco.",
        preview: false,
        documentationURL: "https://github.com/ju1ced/juiced-dashboard",
      });
    }
  }
}
