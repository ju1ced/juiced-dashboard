"use strict";

// Render-path smoke tests for the security card, same hand-rolled fake
// shadow root technique as the room card's render tests (Node has no DOM).

import test from "node:test";
import assert from "node:assert/strict";

import { JuicedDashboardSecurityCard } from "../dist/juiced-dashboard.js";

function makeFakeElement() {
  const el = { _html: "", _text: "", dataset: {} };
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
  const card = Object.create(JuicedDashboardSecurityCard.prototype);
  card._config = null;
  card._hass = null;
  card._cameraIndex = 0;
  card.shadowRoot = makeFakeShadowRoot();
  return card;
}

const HASS = {
  states: {
    "alarm_control_panel.huis": { state: "disarmed", attributes: {} },
    "camera.oprit": { state: "idle", attributes: { entity_picture: "/api/camera_proxy/camera.oprit" } },
    "camera.tuin": { state: "idle", attributes: {} },
    "switch.tuin_privacy": { state: "on", attributes: {} },
  },
};

const CONFIG = {
  type: "custom:juiced-dashboard-security-card",
  security: {
    alarm_entity: "alarm_control_panel.huis",
    cameras: [
      { key: "oprit", name: "Oprit", camera_entity: "camera.oprit" },
      { key: "tuin", name: "Tuin", camera_entity: "camera.tuin", privacy_entity: "switch.tuin_privacy", privacy_service: "toggle" },
    ],
  },
};

test("setConfig + hass never throws, renders the alarm row and both cameras", () => {
  const card = makeCard();
  assert.doesNotThrow(() => card.setConfig(CONFIG));
  assert.doesNotThrow(() => {
    card.hass = HASS;
  });
  const html = card.shadowRoot.innerHTML;
  assert.ok(html.includes("Oprit"));
  assert.ok(html.includes("Tuin"));
  assert.ok(html.includes("Uitgeschakeld")); // alarm disarmed label
});

test("only the camera with a privacy_entity shows a privacy label", () => {
  const card = makeCard();
  card.setConfig(CONFIG);
  card.hass = HASS;
  const html = card.shadowRoot.innerHTML;
  // "Tuin" (the non-active camera in the list) has a privacy chip; the
  // currently-shown camera (Oprit, index 0) never gets a list entry for
  // itself, so this only proves the OTHER camera's chip rendered.
  assert.ok(html.includes("Privacy aan"));
});

test("camera-select click switches the shown camera without throwing", () => {
  const card = makeCard();
  card.setConfig(CONFIG);
  card.hass = HASS;
  assert.doesNotThrow(() => {
    card._onClick({ target: { closest: () => ({ dataset: { action: "camera-select", index: "1" } }) } });
  });
  assert.equal(card._cameraIndex, 1);
});

test("renders nothing but the style tag when neither alarm nor cameras are configured", () => {
  const card = makeCard();
  card.setConfig({ type: "custom:juiced-dashboard-security-card", security: { cameras: [] } });
  card.hass = { states: {} };
  const html = card.shadowRoot.innerHTML;
  assert.ok(!html.includes("<ha-card"));
});

test("cameras never auto-rotate — connecting the card schedules no timer", () => {
  const card = makeCard();
  card.setConfig(CONFIG);
  card.hass = HASS;

  const realSetInterval = globalThis.setInterval;
  let calls = 0;
  globalThis.setInterval = (...args) => {
    calls += 1;
    return realSetInterval(...args);
  };
  try {
    card.connectedCallback();
    assert.equal(calls, 0);
  } finally {
    globalThis.setInterval = realSetInterval;
  }
});

test("an unavailable alarm entity omits the alarm row instead of showing a broken state", () => {
  const card = makeCard();
  card.setConfig({ type: "custom:juiced-dashboard-security-card", security: { alarm_entity: "alarm_control_panel.missing", cameras: [] } });
  card.hass = { states: {} };
  const html = card.shadowRoot.innerHTML;
  assert.ok(!html.includes('class="jsc-alarm'));
});
