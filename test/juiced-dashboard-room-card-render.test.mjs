"use strict";

// Render-path smoke tests. Node has no DOM, so we give the card a minimal
// hand-rolled fake shadow root (innerHTML/getElementById/classList/dataset)
// instead of adding a jsdom dependency — enough to exercise the real
// _renderShell/_renderList/_renderPopup code paths and assert they never
// throw on missing, unknown or unavailable entities.

import test from "node:test";
import assert from "node:assert/strict";

import { JuicedDashboardRoomCard } from "../dist/juiced-dashboard.js";

function makeFakeElement() {
  const el = {
    _html: "",
    _text: "",
    dataset: {},
    classList: {
      _set: new Set(),
      add(c) {
        this._set.add(c);
      },
      remove(c) {
        this._set.delete(c);
      },
      contains(c) {
        return this._set.has(c);
      },
    },
  };
  Object.defineProperty(el, "innerHTML", {
    get() {
      return el._html;
    },
    set(v) {
      el._html = v;
    },
  });
  Object.defineProperty(el, "textContent", {
    get() {
      return el._text;
    },
    set(v) {
      el._text = v;
    },
  });
  return el;
}

function makeFakeShadowRoot() {
  const elements = new Map();
  const root = {
    _html: "",
    addEventListener() {},
    removeEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeFakeElement());
      return elements.get(id);
    },
  };
  Object.defineProperty(root, "innerHTML", {
    get() {
      return root._html;
    },
    set(v) {
      root._html = v;
    },
  });
  return root;
}

function makeCard() {
  const card = Object.create(JuicedDashboardRoomCard.prototype);
  card._config = null;
  card._hass = null;
  card._entityIds = [];
  card._openRoomIndex = null;
  card._built = false;
  card.shadowRoot = makeFakeShadowRoot();
  return card;
}

const RICH_CONFIG = {
  type: "custom:juiced-dashboard-room-card",
  title: "Kamers",
  subtitle: "Test",
  rooms: [
    {
      name: "Bureau",
      icon: "mdi:desk",
      temperature: "sensor.bureau_temp",
      humidity: "sensor.bureau_hum",
      lights: [
        { entity: "light.bureau_1", name: "Bureau" },
        { entity: "light.missing" }, // entity absent from hass.states
      ],
      awnings: [{ entity: "cover.luifel" }],
      media_player: "media_player.kantoor",
      climate: "climate.daikin",
    },
    { name: "Lege kamer" }, // no controls configured at all
  ],
};

const HASS = {
  states: {
    "sensor.bureau_temp": { state: "21.5", attributes: {} },
    "sensor.bureau_hum": { state: "43", attributes: {} },
    "light.bureau_1": { state: "on", attributes: { friendly_name: "Bureau" } },
    "cover.luifel": { state: "open", attributes: { current_position: 40 } },
    "media_player.kantoor": {
      state: "playing",
      attributes: { friendly_name: "Kantoor +1", media_title: "VRT Radio 1" },
    },
    "climate.daikin": {
      state: "cool",
      attributes: {
        current_temperature: 28,
        temperature: 23,
        hvac_modes: ["off", "heat", "cool", "auto"],
        target_temp_step: 0.5,
      },
    },
  },
};

test("setConfig + hass assignment never throws, even with a missing light entity", () => {
  const card = makeCard();
  assert.doesNotThrow(() => card.setConfig(RICH_CONFIG));
  assert.doesNotThrow(() => {
    card.hass = HASS;
  });
  const listHtml = card.shadowRoot.getElementById("list").innerHTML;
  assert.ok(listHtml.includes("Bureau"));
  assert.ok(listHtml.includes("Lege kamer"));
});

test("a room row never shows a quick light-toggle button — opening the popup is the only action", () => {
  const card = makeCard();
  card.setConfig(RICH_CONFIG);
  card.hass = HASS;
  const listHtml = card.shadowRoot.getElementById("list").innerHTML;
  assert.ok(!listHtml.includes('data-action="toggle-light"'));
});

test("opening a room renders all configured sections without throwing", () => {
  const card = makeCard();
  card.setConfig(RICH_CONFIG);
  card.hass = HASS;
  assert.doesNotThrow(() => card._openRoom(0));
  const body = card.shadowRoot.getElementById("popup-body").innerHTML;
  assert.ok(body.includes("Verlichting"));
  assert.ok(body.includes("Luifels"));
  assert.ok(body.includes("Media"));
  assert.ok(body.includes("Klimaat"));
  assert.ok(body.includes("Uit") || body.includes("Niet beschikbaar"));
});

test("a room with no configured controls shows the empty-state message", () => {
  const card = makeCard();
  card.setConfig(RICH_CONFIG);
  card.hass = HASS;
  card._openRoom(1);
  const body = card.shadowRoot.getElementById("popup-body").innerHTML;
  assert.ok(body.includes("Geen snelbediening geconfigureerd"));
});

test("render works with an empty rooms list", () => {
  const card = makeCard();
  assert.doesNotThrow(() => card.setConfig({ type: "custom:juiced-dashboard-room-card", rooms: [] }));
  assert.doesNotThrow(() => {
    card.hass = { states: {} };
  });
});

test("setConfig rejects a config without a rooms list", () => {
  const card = makeCard();
  assert.throws(() => card.setConfig({}), /rooms/);
});

test("setConfig rejects a room without a name", () => {
  const card = makeCard();
  assert.throws(() => card.setConfig({ rooms: [{}] }), /name/);
});

test("rooms with no zone at all render as one flat grid without zone headers", () => {
  const card = makeCard();
  card.setConfig({ type: "custom:juiced-dashboard-room-card", rooms: [{ name: "Bureau" }, { name: "Slaapkamer" }] });
  card.hass = { states: {} };
  const listHtml = card.shadowRoot.getElementById("list").innerHTML;
  assert.ok(!listHtml.includes("jrc-zone-title"));
  assert.ok(listHtml.includes("Bureau"));
  assert.ok(listHtml.includes("Slaapkamer"));
});

test("rooms with a mix of zones are grouped under zone headers, unzoned rooms under Overige", () => {
  const card = makeCard();
  card.setConfig({
    type: "custom:juiced-dashboard-room-card",
    rooms: [
      { name: "Tuinhuis", zone: "buiten" },
      { name: "Bureau", zone: "boven" },
      { name: "Berging" },
    ],
  });
  card.hass = { states: {} };
  const listHtml = card.shadowRoot.getElementById("list").innerHTML;
  assert.ok(listHtml.includes(">Buiten<"));
  assert.ok(listHtml.includes(">Boven<"));
  assert.ok(listHtml.includes(">Overige<"));
  assert.ok(!listHtml.includes(">Gelijkvloers<"));
});
