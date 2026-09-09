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
import { ROOM_ZONES } from "../config/types";
import type { CameraConfig, EditorRoomConfig, JuicedDashboardConfigV1, QuickActionConfig, RoomZone, SecurityConfig, ShortcutConfig, StartView, ThemeMode, TodayConfig } from "../config/types";

const ZONE_LABELS: Record<RoomZone, string> = { buiten: "Buiten", gelijkvloers: "Gelijkvloers", boven: "Boven" };

type HomeAssistantLike = Record<string, unknown>;

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

interface RoomEntityField {
  key: keyof Pick<
    EditorRoomConfig,
    "temperature_entity" | "humidity_entity" | "light_entities" | "cover_entities" | "awning_entities" | "media_player_entity" | "climate_entity"
  >;
  label: string;
  domain?: string;
  multiple?: boolean;
}

const ROOM_ENTITY_FIELDS: readonly RoomEntityField[] = [
  { key: "temperature_entity", label: "Temperatuursensor", domain: "sensor" },
  { key: "humidity_entity", label: "Vochtigheidssensor", domain: "sensor" },
  { key: "light_entities", label: "Lichten", domain: "light", multiple: true },
  { key: "cover_entities", label: "Rolluiken", domain: "cover", multiple: true },
  { key: "awning_entities", label: "Luifels", domain: "cover", multiple: true },
  { key: "media_player_entity", label: "Mediaspeler", domain: "media_player" },
  { key: "climate_entity", label: "Klimaat", domain: "climate" },
];

let newRoomSeed = 0;
let newActionSeed = 0;
let newCameraSeed = 0;
let newShortcutSeed = 0;

/** Vandaag's single-entity fields (everything except the multi-entity waste_entities). */
interface TodayEntityField {
  key: Exclude<keyof JuicedDashboardConfigV1["today"], "waste_entities">;
  label: string;
  domain?: string;
}

const TODAY_ENTITY_FIELDS: readonly TodayEntityField[] = [
  { key: "weather_entity", label: "Weerbron", domain: "weather" },
  { key: "battery_soc_entity", label: "Thuisbatterij SoC", domain: "sensor" },
  { key: "battery_charge_entity", label: "Batterij laden", domain: "sensor" },
  { key: "battery_discharge_entity", label: "Batterij ontladen", domain: "sensor" },
  { key: "solar_power_entity", label: "Zonnepanelen opbrengst", domain: "sensor" },
  { key: "home_consumption_entity", label: "Huisverbruik", domain: "sensor" },
  { key: "monthly_peak_entity", label: "Maandelijkse vermogenspiek", domain: "sensor" },
];

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
    const room: EditorRoomConfig = {
      key: `room-${Date.now().toString(36)}-${newRoomSeed}`,
      name: "Nieuwe kamer",
      light_entities: [],
      cover_entities: [],
      awning_entities: [],
    };
    this._config = { ...this._config, rooms: [...this._config.rooms, room] };
    this._emit();
    this._render();
  }

  private _removeRoom(key: string): void {
    this._config = { ...this._config, rooms: this._config.rooms.filter((room) => room.key !== key) };
    this._emit();
    this._render();
  }

  private _updateToday(patch: Partial<TodayConfig>): void {
    this._config = { ...this._config, today: { ...this._config.today, ...patch } };
    this._emit();
  }

  private _updateAction(key: string, patch: Partial<QuickActionConfig>): void {
    this._config = {
      ...this._config,
      quick_actions: this._config.quick_actions.map((action) => (action.key === key ? { ...action, ...patch } : action)),
    };
    this._emit();
  }

  private _addAction(): void {
    newActionSeed += 1;
    const action: QuickActionConfig = { key: `action-${Date.now().toString(36)}-${newActionSeed}`, label: "Nieuwe actie", entity: "", service: "toggle" };
    this._config = { ...this._config, quick_actions: [...this._config.quick_actions, action] };
    this._emit();
    this._render();
  }

  private _removeAction(key: string): void {
    this._config = { ...this._config, quick_actions: this._config.quick_actions.filter((action) => action.key !== key) };
    this._emit();
    this._render();
  }

  private _updateSecurity(patch: Partial<SecurityConfig>): void {
    this._config = { ...this._config, security: { ...this._config.security, ...patch } };
    this._emit();
  }

  private _updateCamera(key: string, patch: Partial<CameraConfig>): void {
    this._config = {
      ...this._config,
      security: {
        ...this._config.security,
        cameras: this._config.security.cameras.map((camera) => (camera.key === key ? { ...camera, ...patch } : camera)),
      },
    };
    this._emit();
  }

  private _addCamera(): void {
    newCameraSeed += 1;
    const camera: CameraConfig = { key: `camera-${Date.now().toString(36)}-${newCameraSeed}`, name: "Nieuwe camera", camera_entity: "" };
    this._config = { ...this._config, security: { ...this._config.security, cameras: [...this._config.security.cameras, camera] } };
    this._emit();
    this._render();
  }

  private _removeCamera(key: string): void {
    this._config = {
      ...this._config,
      security: { ...this._config.security, cameras: this._config.security.cameras.filter((camera) => camera.key !== key) },
    };
    this._emit();
    this._render();
  }

  private _updateShortcut(key: string, patch: Partial<ShortcutConfig>): void {
    this._config = {
      ...this._config,
      shortcuts: this._config.shortcuts.map((shortcut) => (shortcut.key === key ? { ...shortcut, ...patch } : shortcut)),
    };
    this._emit();
  }

  private _addShortcut(): void {
    newShortcutSeed += 1;
    const shortcut: ShortcutConfig = { key: `shortcut-${Date.now().toString(36)}-${newShortcutSeed}`, label: "Nieuwe snelkoppeling", navigation_path: "" };
    this._config = { ...this._config, shortcuts: [...this._config.shortcuts, shortcut] };
    this._emit();
    this._render();
  }

  private _removeShortcut(key: string): void {
    this._config = { ...this._config, shortcuts: this._config.shortcuts.filter((shortcut) => shortcut.key !== key) };
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

    if (target.dataset.scope === "action") {
      const actionKey = target.dataset.actionKey;
      if (!actionKey) return;
      if (field === "label") this._updateAction(actionKey, { label: target.value });
      if (field === "icon") this._updateAction(actionKey, { icon: target.value || undefined });
      if (field === "service") this._updateAction(actionKey, { service: target.value });
      return;
    }

    if (target.dataset.scope === "camera") {
      const cameraKey = target.dataset.cameraKey;
      if (!cameraKey) return;
      if (field === "name") this._updateCamera(cameraKey, { name: target.value });
      if (field === "privacy_service") this._updateCamera(cameraKey, { privacy_service: target.value || undefined });
      return;
    }

    if (target.dataset.scope === "shortcut") {
      const shortcutKey = target.dataset.shortcutKey;
      if (!shortcutKey) return;
      if (field === "label") this._updateShortcut(shortcutKey, { label: target.value });
      if (field === "icon") this._updateShortcut(shortcutKey, { icon: target.value || undefined });
      if (field === "navigation_path") this._updateShortcut(shortcutKey, { navigation_path: target.value });
      return;
    }

    const roomKey = target.dataset.room;
    if (!roomKey) return;
    if (field === "name") this._updateRoom(roomKey, { name: target.value });
    if (field === "icon") this._updateRoom(roomKey, { icon: target.value || undefined });
    if (field === "zone") this._updateRoom(roomKey, { zone: (target.value || undefined) as RoomZone | undefined });
  }

  private _onSelectorChange(event: CustomEvent<{ value: unknown }>): void {
    const target = event.target as HTMLElement | null;
    if (!target || target.tagName.toLowerCase() !== "ha-selector") return;
    event.stopPropagation();
    const field = target.dataset.field;
    const scope = target.dataset.scope;
    if (!field) return;

    if (scope === "general") {
      if (field === "person_entities") {
        const value = Array.isArray(event.detail?.value) ? event.detail.value.filter((v): v is string => typeof v === "string") : [];
        this._updateGeneral("person_entities", value);
      }
      return;
    }

    if (scope === "today") {
      if (field === "waste_entities") {
        const value = Array.isArray(event.detail?.value) ? event.detail.value.filter((v): v is string => typeof v === "string") : [];
        this._updateToday({ waste_entities: value });
        return;
      }
      const value = typeof event.detail?.value === "string" ? event.detail.value : undefined;
      this._updateToday({ [field]: value } as Partial<TodayConfig>);
      return;
    }

    if (scope === "action") {
      const actionKey = target.dataset.actionKey;
      if (!actionKey) return;
      const value = typeof event.detail?.value === "string" ? event.detail.value : "";
      this._updateAction(actionKey, { entity: value });
      return;
    }

    if (scope === "security") {
      const value = typeof event.detail?.value === "string" ? event.detail.value : undefined;
      this._updateSecurity({ alarm_entity: value });
      return;
    }

    if (scope === "camera") {
      const cameraKey = target.dataset.cameraKey;
      if (!cameraKey) return;
      const value = typeof event.detail?.value === "string" ? event.detail.value : undefined;
      if (field === "camera_entity") this._updateCamera(cameraKey, { camera_entity: value ?? "" });
      if (field === "privacy_entity") this._updateCamera(cameraKey, { privacy_entity: value });
      return;
    }

    const roomKey = target.dataset.room;
    if (!roomKey) return;
    const fieldDef = ROOM_ENTITY_FIELDS.find((candidate) => candidate.key === field);
    if (fieldDef?.multiple) {
      const value = Array.isArray(event.detail?.value) ? event.detail.value.filter((v): v is string => typeof v === "string") : [];
      this._updateRoom(roomKey, { [field]: value } as Partial<EditorRoomConfig>);
      return;
    }
    const value = typeof event.detail?.value === "string" ? event.detail.value : undefined;
    this._updateRoom(roomKey, { [field]: value } as Partial<EditorRoomConfig>);
  }

  private _onClick(event: MouseEvent): void {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-action]");
    if (!target) return;
    if (target.dataset.action === "add-room") this._addRoom();
    if (target.dataset.action === "remove-room" && target.dataset.room) this._removeRoom(target.dataset.room);
    if (target.dataset.action === "add-action") this._addAction();
    if (target.dataset.action === "remove-action" && target.dataset.actionKey) this._removeAction(target.dataset.actionKey);
    if (target.dataset.action === "add-camera") this._addCamera();
    if (target.dataset.action === "remove-camera" && target.dataset.cameraKey) this._removeCamera(target.dataset.cameraKey);
    if (target.dataset.action === "add-shortcut") this._addShortcut();
    if (target.dataset.action === "remove-shortcut" && target.dataset.shortcutKey) this._removeShortcut(target.dataset.shortcutKey);
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
        <label>Bewoners (Gezin-kaart op Home)
          <ha-selector data-scope="general" data-field="person_entities"></ha-selector>
        </label>
      </div>

      <div class="jde-section">
        <h3>Vandaag</h3>
        ${TODAY_ENTITY_FIELDS.map(
          (field) => `
          <label>${escapeHtml(field.label)}
            <ha-selector data-scope="today" data-field="${field.key}"></ha-selector>
          </label>`,
        ).join("")}
        <label>Afvalbronnen
          <ha-selector data-scope="today" data-field="waste_entities"></ha-selector>
        </label>
      </div>

      <div class="jde-section">
        <h3>Security</h3>
        <label>Alarm
          <ha-selector data-scope="security" data-field="alarm_entity"></ha-selector>
        </label>
        <div class="jde-section-head">
          <h4>Camera's</h4>
          <button type="button" data-action="add-camera">+ Camera toevoegen</button>
        </div>
        ${c.security.cameras.length === 0 ? `<p class="jde-empty">Nog geen camera's geconfigureerd.</p>` : c.security.cameras.map((camera) => this._cameraHtml(camera)).join("")}
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Snelacties</h3>
          <button type="button" data-action="add-action">+ Actie toevoegen</button>
        </div>
        ${c.quick_actions.length === 0 ? `<p class="jde-empty">Nog geen snelacties geconfigureerd.</p>` : c.quick_actions.map((action) => this._actionHtml(action)).join("")}
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Snel naar</h3>
          <button type="button" data-action="add-shortcut">+ Snelkoppeling toevoegen</button>
        </div>
        ${c.shortcuts.length === 0 ? `<p class="jde-empty">Nog geen snelkoppelingen geconfigureerd.</p>` : c.shortcuts.map((shortcut) => this._shortcutHtml(shortcut)).join("")}
      </div>

      <div class="jde-section">
        <div class="jde-section-head">
          <h3>Kamers</h3>
          <button type="button" data-action="add-room">+ Kamer toevoegen</button>
        </div>
        ${c.rooms.length === 0 ? `<p class="jde-empty">Nog geen kamers geconfigureerd.</p>` : c.rooms.map((room) => this._roomHtml(room)).join("")}
      </div>`;

    // Read data-*/data-field back off each element rather than building CSS
    // selector strings from user-editable keys/names (quoting them into a
    // selector would break if one ever contained a `"`).
    this.root.querySelectorAll("ha-selector").forEach((node) => {
      const el = node as HTMLElement & { hass?: HomeAssistantLike; selector?: unknown; value?: unknown };
      const scope = el.dataset.scope;
      const fieldKey = el.dataset.field;
      if (!fieldKey) return;

      if (scope === "general") {
        if (fieldKey === "person_entities") {
          el.selector = { entity: { domain: "person", multiple: true } };
          el.value = c.general.person_entities ?? [];
          if (this._hass) el.hass = this._hass;
        }
        return;
      }

      if (scope === "today") {
        if (fieldKey === "waste_entities") {
          el.selector = { entity: { multiple: true } };
          el.value = c.today.waste_entities ?? [];
        } else {
          const fieldDef = TODAY_ENTITY_FIELDS.find((candidate) => candidate.key === fieldKey);
          el.selector = { entity: fieldDef?.domain ? { domain: fieldDef.domain } : {} };
          el.value = (c.today[fieldKey as TodayEntityField["key"]] as string | undefined) ?? "";
        }
        if (this._hass) el.hass = this._hass;
        return;
      }

      if (scope === "action") {
        const actionKey = el.dataset.actionKey;
        const action = c.quick_actions.find((candidate) => candidate.key === actionKey);
        if (!action) return;
        el.selector = { entity: {} };
        el.value = action.entity ?? "";
        if (this._hass) el.hass = this._hass;
        return;
      }

      if (scope === "security") {
        el.selector = { entity: { domain: "alarm_control_panel" } };
        el.value = c.security.alarm_entity ?? "";
        if (this._hass) el.hass = this._hass;
        return;
      }

      if (scope === "camera") {
        const cameraKey = el.dataset.cameraKey;
        const camera = c.security.cameras.find((candidate) => candidate.key === cameraKey);
        if (!camera) return;
        if (fieldKey === "camera_entity") {
          el.selector = { entity: { domain: "camera" } };
          el.value = camera.camera_entity ?? "";
        } else {
          el.selector = { entity: {} };
          el.value = camera.privacy_entity ?? "";
        }
        if (this._hass) el.hass = this._hass;
        return;
      }

      const roomKey = el.dataset.room;
      if (!roomKey) return;
      const room = c.rooms.find((candidate) => candidate.key === roomKey);
      const fieldDef = ROOM_ENTITY_FIELDS.find((candidate) => candidate.key === fieldKey);
      if (!room || !fieldDef) return;
      if (fieldDef.multiple) {
        el.selector = { entity: { multiple: true, ...(fieldDef.domain ? { domain: fieldDef.domain } : {}) } };
        el.value = room[fieldDef.key] ?? [];
      } else {
        el.selector = { entity: fieldDef.domain ? { domain: fieldDef.domain } : {} };
        el.value = room[fieldDef.key] ?? "";
      }
      if (this._hass) el.hass = this._hass;
    });
  }

  private _actionHtml(action: QuickActionConfig): string {
    return `
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-scope="action" data-action-key="${action.key}" data-field="label" value="${escapeHtml(action.label)}" placeholder="Label">
          <button type="button" data-action="remove-action" data-action-key="${action.key}" aria-label="Actie verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-scope="action" data-action-key="${action.key}" data-field="icon" value="${escapeHtml(action.icon ?? "")}" placeholder="mdi:lightning-bolt">
        </label>
        <label>Entiteit
          <ha-selector data-scope="action" data-action-key="${action.key}" data-field="entity"></ha-selector>
        </label>
        <label>Service (bv. toggle, turn_on, alarm_arm_home)
          <input type="text" data-scope="action" data-action-key="${action.key}" data-field="service" value="${escapeHtml(action.service)}" placeholder="toggle">
        </label>
      </div>`;
  }

  private _cameraHtml(camera: CameraConfig): string {
    return `
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-scope="camera" data-camera-key="${camera.key}" data-field="name" value="${escapeHtml(camera.name)}" placeholder="Cameranaam">
          <button type="button" data-action="remove-camera" data-camera-key="${camera.key}" aria-label="Camera verwijderen">&times;</button>
        </div>
        <label>Camera
          <ha-selector data-scope="camera" data-camera-key="${camera.key}" data-field="camera_entity"></ha-selector>
        </label>
        <label>Privacyschakelaar (optioneel — enkel deze camera toont dan een privacylabel)
          <ha-selector data-scope="camera" data-camera-key="${camera.key}" data-field="privacy_entity"></ha-selector>
        </label>
        ${
          camera.privacy_entity
            ? `<label>Privacy-service (bv. toggle)
                 <input type="text" data-scope="camera" data-camera-key="${camera.key}" data-field="privacy_service" value="${escapeHtml(camera.privacy_service ?? "")}" placeholder="toggle">
               </label>`
            : ""
        }
      </div>`;
  }

  private _shortcutHtml(shortcut: ShortcutConfig): string {
    return `
      <div class="jde-room">
        <div class="jde-room-head">
          <input type="text" data-scope="shortcut" data-shortcut-key="${shortcut.key}" data-field="label" value="${escapeHtml(shortcut.label)}" placeholder="Label">
          <button type="button" data-action="remove-shortcut" data-shortcut-key="${shortcut.key}" aria-label="Snelkoppeling verwijderen">&times;</button>
        </div>
        <label>Icoon
          <input type="text" data-scope="shortcut" data-shortcut-key="${shortcut.key}" data-field="icon" value="${escapeHtml(shortcut.icon ?? "")}" placeholder="mdi:car-electric">
        </label>
        <label>Pad (bv. /kia-ev6 of /juiced-dashboard-test/energy)
          <input type="text" data-scope="shortcut" data-shortcut-key="${shortcut.key}" data-field="navigation_path" value="${escapeHtml(shortcut.navigation_path)}" placeholder="/dashboard-url-path">
        </label>
      </div>`;
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
        <label>Zone
          <select data-room="${room.key}" data-field="zone">
            <option value="" ${!room.zone ? "selected" : ""}>Geen</option>
            ${ROOM_ZONES.map((zone) => `<option value="${zone}" ${room.zone === zone ? "selected" : ""}>${escapeHtml(ZONE_LABELS[zone])}</option>`).join("")}
          </select>
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
  .jde-section-head h3, .jde-section-head h4 { margin: 0; font-size: 13px; font-weight: 600; }
  .jde-section-head { margin-top: 16px; }
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
