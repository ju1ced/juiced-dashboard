"use strict";

// Render-path smoke tests for the room detail subview card, mirroring the
// pattern used for the room card's popup: a minimal hand-rolled fake shadow
// root, exercising the real _render/_onClick code paths.

import test from "node:test";
import assert from "node:assert/strict";

import { JuicedDashboardRoomDetailCard } from "../dist/juiced-dashboard.js";

function makeFakeElement() {
  const el = { _html: "", dataset: {} };
  Object.defineProperty(el, "innerHTML", {
    get() {
      return el._html;
    },
    set(v) {
      el._html = v;
    },
  });
  return el;
}

function makeFakeShadowRoot() {
  const root = makeFakeElement();
  root.addEventListener = () => {};
  root.removeEventListener = () => {};
  return root;
}

function makeCard() {
  const card = Object.create(JuicedDashboardRoomDetailCard.prototype);
  card._config = null;
  card._hass = null;
  card.shadowRoot = makeFakeShadowRoot();
  return card;
}

const RICH_ROOM = {
  name: "Bureau",
  icon: "mdi:desk",
  temperature: "sensor.bureau_temp",
  humidity: "sensor.bureau_hum",
  lights: [
    { entity: "light.bureau_1", name: "Bureau" },
    { entity: "light.missing" },
  ],
  covers: [{ entity: "cover.rolluik_bureau" }],
  awnings: [{ entity: "cover.luifel_bureau" }],
  media_player: "media_player.kantoor",
  climate: "climate.daikin",
};

const HASS = {
  states: {
    "sensor.bureau_temp": { state: "21.5", attributes: {} },
    "sensor.bureau_hum": { state: "43", attributes: {} },
    "light.bureau_1": { state: "on", attributes: { friendly_name: "Bureau" } },
    "cover.rolluik_bureau": { state: "open", attributes: { current_position: 70 } },
    "cover.luifel_bureau": { state: "closed", attributes: { current_position: 0 } },
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

test("setConfig + hass assignment never throws and renders the hero, overview and all sections", () => {
  const card = makeCard();
  assert.doesNotThrow(() => card.setConfig({ type: "custom:juiced-dashboard-room-detail-card", room: RICH_ROOM }));
  assert.doesNotThrow(() => {
    card.hass = HASS;
  });
  const html = card.shadowRoot.innerHTML;
  assert.ok(html.includes("Bureau"));
  assert.ok(html.includes("jrd-overview"));
  assert.ok(html.includes("Temperatuur"));
  assert.ok(html.includes("Vochtigheid"));
  assert.ok(html.includes("Lampen aan"));
  assert.ok(html.includes("Klimaat"));
  assert.ok(html.includes("Verlichting"));
  assert.ok(html.includes("Rolluiken"));
  assert.ok(html.includes("Luifels"));
  assert.ok(html.includes("Media"));
});

test("a room with nothing configured shows the empty-state message", () => {
  const card = makeCard();
  card.setConfig({ type: "custom:juiced-dashboard-room-detail-card", room: { name: "Berging" } });
  card.hass = { states: {} };
  const html = card.shadowRoot.innerHTML;
  assert.ok(html.includes("Geen bediening of sensoren geconfigureerd"));
  assert.ok(!html.includes("jrd-overview"));
});

test("a room with only a climate entity gets an overview tile but no light/cover/media sections", () => {
  const card = makeCard();
  card.setConfig({ type: "custom:juiced-dashboard-room-detail-card", room: { name: "Zolder", climate: "climate.daikin" } });
  card.hass = HASS;
  const html = card.shadowRoot.innerHTML;
  assert.ok(html.includes("jrd-overview"));
  assert.ok(!html.includes("Verlichting"));
  assert.ok(!html.includes("Media"));
});

test("click handlers for every action never throw", () => {
  const card = makeCard();
  card.setConfig({ type: "custom:juiced-dashboard-room-detail-card", room: RICH_ROOM });
  card.hass = HASS;
  const calls = [];
  card._hass = { ...HASS, callService: (domain, service, data) => calls.push({ domain, service, data }) };

  const actions = [
    { action: "toggle-light", entity: "light.bureau_1" },
    { action: "cover-open", entity: "cover.rolluik_bureau" },
    { action: "cover-stop", entity: "cover.rolluik_bureau" },
    { action: "cover-close", entity: "cover.rolluik_bureau" },
    { action: "media-toggle", entity: "media_player.kantoor" },
    { action: "climate-mode", entity: "climate.daikin", mode: "heat" },
    { action: "climate-step", entity: "climate.daikin", target: "23", step: "0.5" },
  ];
  for (const dataset of actions) {
    assert.doesNotThrow(() => {
      card._onClick({ target: { closest: () => ({ dataset }) } });
    });
  }
  assert.equal(calls.length, actions.length);
});

test("a click with no data-action target is a no-op", () => {
  const card = makeCard();
  card.setConfig({ type: "custom:juiced-dashboard-room-detail-card", room: RICH_ROOM });
  card.hass = HASS;
  assert.doesNotThrow(() => {
    card._onClick({ target: { closest: () => null } });
  });
});
