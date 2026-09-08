/**
 * Strategy config editor for `custom:juiced-dashboard` — a native Home
 * Assistant dashboard-settings form (no hand-written YAML). Registered via
 * `JuicedDashboardStrategy.getConfigElement()`.
 *
 * Uses Home Assistant's own `<ha-selector>` element for entity pickers
 * (fed `.hass` + `.selector` + `.value`, listens for the bubbling
 * `value-changed` event per HA's selector contract — plain `change` is not
 * fired by selectors). `<ha-selector>` itself is provided by the Home
 * Assistant frontend at runtime; this editor only ever references it by tag
 * name, so it has no build-time dependency on HA's frontend package.
 */

import { compileConfig } from "../config/compiler";
import type { EditorRoomConfig, JuicedDashboardConfigV1, StartView, ThemeMode } from "../config/types";

type HomeAssistantLike = Record<string, unknown>;

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

interface RoomEntityField {
  key: keyof Pick<
    EditorRoomConfig,
    "temperature_entity" | "humidity_entity" | "light_entity" | "cover_entity" | "awning_entity" | "media_player_entity" | "climate_entity"
  >;
  label: string;
  domain?: string;
}

const ROOM_ENTITY_FIELDS: readonly RoomEntityField[] = [
  { key: "temperature_entity", label: "Temperatuursensor", domain: "sensor" },
  { key: "humidity_entity", label: "Vochtigheidssensor", domain: "sensor" },
  { key: "light_entity", label: "Licht", domain: "light" },
  { key: "cover_entity", label: "Rolluik", domain: "cover" },
  { key: "awning_entity", label: "Luifel", domain: "cover" },
  { key: "media_player_entity", label: "Mediaspeler", domain: "media_player" },
  { key: "climate_entity", label: "Klimaat", domain: "climate" },
];

let newRoomSeed = 0;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export class JuicedDashboardStrategyEditor extends HTMLElementBase {
  private _config: JuicedDashboardConfigV1;
  private _hass: HomeAssistantLike | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = compileConfig(undefined);
    this._onInput = this._onInput.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onSelectorChange = this._onSelectorChange.bind(this);
  }

  private get root(): ShadowRoot {
    return this.shadowRoot as ShadowRoot;
  }

  setConfig(config: unknown): void {
    this._config = compileConfig(config);
    this._render();
  }

  set hass(hass: HomeAssistantLike) {
    this._hass = hass;
    this.root.querySelectorAll("ha-selector").forEach((el) => {
      (el as unknown as { hass: HomeAssistantLike }).hass = hass;
    });
  }

  get hass(): HomeAssistantLike | null {
    return this._hass;
  }

  connectedCallback(): void {
    this.root.addEventListener("input", this._onInput as EventListener);
    this.root.addEventListener("click", this._onClick as EventListener);
    this.root.addEventListener("value-changed", this._onSelectorChange as EventListener);
  }

  disconnectedCallback(): void {
    this.root.removeEventListener("input", this._onInput as EventListener);
    this.root.removeEventListener("click", this._onClick as EventListener);
    this.root.removeEventListener("value-changed", this._onSelectorChange as EventListener);
  }

  private _emit(): void {
    this.dispatchEvent(new CustomEvent("config-changed", { bubbles: true, composed: true, detail: { config: this._config } }));
  }

  private _updateGeneral<K extends keyof JuicedDashboardConfigV1["general"]>(key: K, value: JuicedDashboardConfigV1["general"][K]): void {
    this._config = { ...this._config, general: { ...this._config.general, [key]: value } };
    this._emit();
  }

  private _updateRoom(key: string, patch: Partial<EditorRoomConfig>): void {
    this._config = {
      ...this._config,
      rooms: this._config.rooms.map((room) => (room.key === key ? { ...room, ...patch } : room)),
    };
    this._emit();
  }

  private _addRoom(): void {
    newRoomSeed += 1;
    const room: EditorRoomConfig = { key: `room-${Date.now().toString(36)}-${newRoomSeed}`, name: "Nieuwe kamer" };
    this._config = { ...this._config, rooms: [...this._config.rooms, room] };
    this._emit();
    this._render();
  }

  private _removeRoom(key: string): void {
    this._config = { ...this._config, rooms: this._config.rooms.filter((room) => room.key !== key) };
    this._emit();
    this._render();
  }

  private _onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement | null;
    if (!target) return;
    const field = target.dataset.field;
    if (!field) return;

    if (target.dataset.scope === "general") {
      if (field === "title") this._updateGeneral("title", target.value);
      if (field === "start_view") this._updateGeneral("start_view", target.value as StartView);
      if (field === "theme_mode") this._updateGeneral("theme_mode", target.value as ThemeMode);
      return;
    }

    const roomKey = target.dataset.room;
    if (!roomKey) return;
    if (field === "name") this._updateRoom(roomKey, { name: target.value });
    if (field === "icon") this._updateRoom(roomKey, { icon: target.value || undefined });
  }

  private _onSelectorChange(event: CustomEvent<{ value: unknown }>): void {
    const target = event.target as HTMLElement | null;
    if (!target || target.tagName.toLowerCase() !== "ha-selector") return;
    event.stopPropagation();
    const field = target.dataset.field as RoomEntityField["key"] | undefined;
    const roomKey = target.dataset.room;
    if (!field || !roomKey) return;
    const value = typeof event.detail?.value === "string" ? event.detail.value : undefined;
    this._updateRoom(roomKey, { [field]: value } as Partial<EditorRoomConfig>);
  }

  private _onClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-action]");
    if (!target) return;
    if (target.dataset.action === "add-room") this._addRoom();
    if (target.dataset.action === "remove-room" && target.dataset.room) this._removeRoom(target.dataset.room);
  }

  private _render(): void {
    const c = this._config;
    this.root.innerHTML = `
      <style>${EDITOR_CSS}</style>
      <div class="jde-section">
        <h3>Algemeen</h3>
        <label>Titel
          <input type="text" data-scope="general" data-field="title" value="${escapeHtml(c.general.title)}">
        </label>
        <label>Startpagina
          <select data-scope="general" data-field="start_view">
            <option value="home" ${c.general.start_view === "home" ? "selected" : ""}>Home</option>
            <option value="rooms" ${c.general.start_view === "rooms" ? "selected" : ""}>Kamers</option>
          </select>
        </label>
        <label>Thema
          <select data-scope="general" data-field="theme_mode">
            <option value="system" ${c.general.theme_mode === "system" ? "selected" : ""}>Systeem</option>
            <option value="light" ${c.general.theme_mode === "light" ? "selected" : ""}>Licht</option>
            <option value="dark" ${c.general.theme_mode === "dark" ? "selected" : ""}>Donker</option>
          </select>
        </label>
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Kamers</h3>
          <button type="button" data-action="add-room">+ Kamer toevoegen</button>
        </div>
        ${c.rooms.length === 0 ? `<p class="jde-empty">Nog geen kamers geconfigureerd.</p>` : c.rooms.map((room) => this._roomHtml(room)).join("")}
      </div>`;

    // Read data-room/data-field back off each element rather than building
    // CSS selector strings from room keys (room keys are user-editable via
    // the name field's slug — quoting them into a selector would break if a
    // key ever contained a `"`).
    this.root.querySelectorAll("ha-selector").forEach((node) => {
      const el = node as HTMLElement & { hass?: HomeAssistantLike; selector?: unknown; value?: unknown };
      const roomKey = el.dataset.room;
      const fieldKey = el.dataset.field as RoomEntityField["key"] | undefined;
      if (!roomKey || !fieldKey) return;
      const room = c.rooms.find((candidate) => candidate.key === roomKey);
      const fieldDef = ROOM_ENTITY_FIELDS.find((candidate) => candidate.key === fieldKey);
      if (!room || !fieldDef) return;
      el.selector = { entity: fieldDef.domain ? { domain: fieldDef.domain } : {} };
      el.value = room[fieldKey] ?? "";
      if (this._hass) el.hass = this._hass;
    });
  }

  private _roomHtml(room: EditorRoomConfig): string {
    return `
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-room="${room.key}" data-field="name" value="${escapeHtml(room.name)}" placeholder="Kamernaam">
          <button type="button" data-action="remove-room" data-room="${room.key}" aria-label="Kamer verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-room="${room.key}" data-field="icon" value="${escapeHtml(room.icon ?? "")}" placeholder="mdi:sofa">
        </label>
        ${ROOM_ENTITY_FIELDS.map(
          (field) => `
          <label>${escapeHtml(field.label)}
            <ha-selector data-room="${room.key}" data-field="${field.key}"></ha-selector>
          </label>`,
        ).join("")}
      </div>`;
  }
}

const EDITOR_CSS = `
  :host { display: block; font-family: var(--paper-font-body1_-_font-family, inherit); color: var(--primary-text-color); }
  .jde-section { padding: 16px 0; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
  .jde-section:last-child { border-bottom: 0; }
  .jde-section h3 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
  .jde-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .jde-section-head h3 { margin: 0; }
  .jde-section-head button, .jde-room-head button {
    border: 1px solid var(--divider-color, #e0e0e0); background: var(--card-background-color, transparent);
    color: var(--primary-text-color); border-radius: 8px; padding: 6px 12px; cursor: pointer;
  }
  label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; }
  input[type="text"], select {
    padding: 8px 10px; border-radius: 8px; border: 1px solid var(--divider-color, #ccc);
    background: var(--card-background-color, #fff); color: var(--primary-text-color); font-size: 14px;
  }
  .jde-empty { color: var(--secondary-text-color); font-size: 13px; }
  .jde-room { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
  .jde-room-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
  .jde-room-head input { flex: 1; font-weight: 600; }
  .jde-room-head button { width: 32px; height: 32px; padding: 0; flex: none; }
`;

export function registerJuicedDashboardEditor(): void {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("juiced-dashboard-strategy-editor")) {
    customElements.define("juiced-dashboard-strategy-editor", JuicedDashboardStrategyEditor);
  }
}
