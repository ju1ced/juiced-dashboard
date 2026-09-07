"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import {
  closeCover,
  collectEntityIds,
  coverPosition,
  coverPositionLabel,
  displayName,
  entityState,
  escapeHtml,
  formatNumber,
  formatTemp,
  hasRelevantChange,
  humanize,
  hvacModeLabel,
  isUnavailable,
  openCover,
  roomEntityIds,
  roomFlag,
  roomHasControls,
  roomLightsOn,
  roomStatLine,
  setHvacMode,
  stepClimateTarget,
  stopCover,
  toggleLight,
  toggleMediaPlayPause,
} from "../dist/juiced-dashboard.js";

function fakeHass() {
  const calls = [];
  return {
    calls,
    callService(domain, service, data) {
      calls.push({ domain, service, data });
    },
  };
}

test("escapeHtml escapes the five reserved characters", () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("escapeHtml treats null/undefined as empty string", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
});

test("isUnavailable flags unavailable/unknown/missing states", () => {
  assert.equal(isUnavailable("unavailable"), true);
  assert.equal(isUnavailable("unknown"), true);
  assert.equal(isUnavailable(undefined), true);
  assert.equal(isUnavailable(null), true);
  assert.equal(isUnavailable("on"), false);
  assert.equal(isUnavailable("21.5"), false);
});

test("entityState returns null for missing entity or hass", () => {
  assert.equal(entityState(null, "light.x"), null);
  assert.equal(entityState({ states: {} }, "light.x"), null);
  assert.equal(entityState({ states: {} }, null), null);
});

test("entityState returns the state object when present", () => {
  const hass = { states: { "light.x": { state: "on" } } };
  assert.deepEqual(entityState(hass, "light.x"), { state: "on" });
});

test("formatNumber uses comma decimals and clamps to the requested precision", () => {
  assert.equal(formatNumber(21.456, 1), "21,5");
  assert.equal(formatNumber(41, 0), "41");
  assert.equal(formatNumber("not-a-number"), null);
});

test("formatTemp appends the degree sign", () => {
  assert.equal(formatTemp(23, 1), "23,0°");
  assert.equal(formatTemp("unavailable"), null);
});

test("hvacModeLabel translates known modes and falls back for unknown ones", () => {
  assert.equal(hvacModeLabel("cool"), "Koelen");
  assert.equal(hvacModeLabel("heat_cool"), "Auto");
  assert.equal(hvacModeLabel("some_custom_mode"), "Some custom mode");
  assert.equal(hvacModeLabel(undefined), "Onbekend");
});

test("humanize replaces underscores and capitalises the first letter", () => {
  assert.equal(humanize("heat_cool"), "Heat cool");
  assert.equal(humanize(""), "");
});

test("coverPosition prefers current_position, falls back to open/closed state", () => {
  assert.equal(coverPosition({ state: "open", attributes: { current_position: 42 } }), 42);
  assert.equal(coverPosition({ state: "open", attributes: {} }), 100);
  assert.equal(coverPosition({ state: "closed", attributes: {} }), 0);
  assert.equal(coverPosition({ state: "opening", attributes: {} }), null);
  assert.equal(coverPosition(null), null);
});

test("coverPositionLabel renders a percentage or an em dash", () => {
  assert.equal(coverPositionLabel({ state: "closed", attributes: {} }), "0%");
  assert.equal(coverPositionLabel(null), "—");
});

test("displayName prefers configured name, then friendly_name, then the fallback", () => {
  assert.equal(displayName("Living", { attributes: { friendly_name: "Woonkamer licht" } }, "light.x"), "Living");
  assert.equal(displayName(null, { attributes: { friendly_name: "Woonkamer licht" } }, "light.x"), "Woonkamer licht");
  assert.equal(displayName(null, null, "light.x"), "light.x");
});

test("roomEntityIds collects every entity id referenced by a room, ignoring non-entity strings", () => {
  const room = {
    name: "Test",
    temperature: "sensor.t",
    humidity: "sensor.h",
    media_player: "media_player.m",
    climate: "climate.c",
    lights: [{ entity: "light.a" }, { entity: "light.b" }],
    covers: [{ entity: "cover.c1" }],
    awnings: [{ entity: "cover.a1" }],
    icon: "mdi:desk",
  };
  const ids = roomEntityIds(room);
  assert.deepEqual(
    ids.sort(),
    ["climate.c", "cover.a1", "cover.c1", "light.a", "light.b", "media_player.m", "sensor.h", "sensor.t"].sort(),
  );
});

test("collectEntityIds deduplicates across rooms", () => {
  const config = {
    rooms: [
      { name: "A", lights: [{ entity: "light.shared" }] },
      { name: "B", lights: [{ entity: "light.shared" }, { entity: "light.only_b" }] },
    ],
  };
  assert.deepEqual(collectEntityIds(config).sort(), ["light.only_b", "light.shared"]);
});

test("hasRelevantChange is true on the first call (no previous hass)", () => {
  assert.equal(hasRelevantChange(null, { states: {} }, []), true);
});

test("hasRelevantChange is false when tracked entities are unchanged", () => {
  const prev = { states: { "light.a": { state: "on", last_updated: "t1" } } };
  const next = { states: { "light.a": { state: "on", last_updated: "t1" } } };
  assert.equal(hasRelevantChange(prev, next, ["light.a"]), false);
});

test("hasRelevantChange is true when a tracked entity's state changed", () => {
  const prev = { states: { "light.a": { state: "off", last_updated: "t1" } } };
  const next = { states: { "light.a": { state: "on", last_updated: "t2" } } };
  assert.equal(hasRelevantChange(prev, next, ["light.a"]), true);
});

test("hasRelevantChange ignores entities outside the tracked list", () => {
  const prev = { states: { "light.other": { state: "off", last_updated: "t1" } } };
  const next = { states: { "light.other": { state: "on", last_updated: "t2" } } };
  assert.equal(hasRelevantChange(prev, next, ["light.tracked"]), false);
});

test("roomStatLine combines temperature and humidity with a comma decimal", () => {
  const hass = {
    states: {
      "sensor.t": { state: "21.5" },
      "sensor.h": { state: "43" },
    },
  };
  const room = { name: "Test", temperature: "sensor.t", humidity: "sensor.h" };
  assert.equal(roomStatLine(hass, room), "21,5° · 43%");
});

test("roomStatLine falls back to the idle text (default 'Rustig') when sensors are missing", () => {
  assert.equal(roomStatLine({ states: {} }, { name: "Test" }), "Rustig");
  assert.equal(roomStatLine({ states: {} }, { name: "Test", idle_text: "Alles uit" }), "Alles uit");
});

test("roomStatLine skips an unavailable sensor but keeps the other one", () => {
  const hass = {
    states: {
      "sensor.t": { state: "unavailable" },
      "sensor.h": { state: "50" },
    },
  };
  const room = { name: "Test", temperature: "sensor.t", humidity: "sensor.h" };
  assert.equal(roomStatLine(hass, room), "50%");
});

test("roomLightsOn counts only lights whose state is exactly 'on'", () => {
  const hass = {
    states: {
      "light.a": { state: "on" },
      "light.b": { state: "off" },
      "light.c": { state: "on" },
    },
  };
  const room = { name: "Test", lights: [{ entity: "light.a" }, { entity: "light.b" }, { entity: "light.c" }] };
  assert.equal(roomLightsOn(hass, room), 2);
});

test("roomFlag pluralises correctly and returns null when nothing is on", () => {
  const hassOne = { states: { "light.a": { state: "on" } } };
  const hassNone = { states: { "light.a": { state: "off" } } };
  const room = { name: "Test", lights: [{ entity: "light.a" }] };
  assert.equal(roomFlag(hassOne, room), "1 lamp aan");
  assert.equal(roomFlag(hassNone, room), null);
});

test("roomHasControls is true when any category is populated", () => {
  assert.equal(roomHasControls({ name: "Test", lights: [{ entity: "light.a" }] }), true);
  assert.equal(roomHasControls({ name: "Test", climate: "climate.a" }), true);
  assert.equal(roomHasControls({ name: "Test" }), false);
  assert.equal(roomHasControls({ name: "Test", lights: [], covers: [], awnings: [] }), false);
});

test("toggleLight calls light.toggle on the given entity", () => {
  const hass = fakeHass();
  toggleLight(hass, "light.bureau");
  assert.deepEqual(hass.calls, [{ domain: "light", service: "toggle", data: { entity_id: "light.bureau" } }]);
});

test("cover actions call the matching cover.* service", () => {
  const hass = fakeHass();
  openCover(hass, "cover.a");
  closeCover(hass, "cover.a");
  stopCover(hass, "cover.a");
  assert.deepEqual(
    hass.calls.map((c) => c.service),
    ["open_cover", "close_cover", "stop_cover"],
  );
});

test("setHvacMode passes the mode through", () => {
  const hass = fakeHass();
  setHvacMode(hass, "climate.a", "cool");
  assert.deepEqual(hass.calls, [
    { domain: "climate", service: "set_hvac_mode", data: { entity_id: "climate.a", hvac_mode: "cool" } },
  ]);
});

test("toggleMediaPlayPause calls media_player.media_play_pause", () => {
  const hass = fakeHass();
  toggleMediaPlayPause(hass, "media_player.kantoor");
  assert.deepEqual(hass.calls, [
    { domain: "media_player", service: "media_play_pause", data: { entity_id: "media_player.kantoor" } },
  ]);
});

test("stepClimateTarget adds the step to the current target", () => {
  const hass = fakeHass();
  stepClimateTarget(hass, "climate.a", 23, 0.5);
  assert.deepEqual(hass.calls, [
    { domain: "climate", service: "set_temperature", data: { entity_id: "climate.a", temperature: 23.5 } },
  ]);
});

test("stepClimateTarget falls back to a default base when the target is an empty string (no `temperature` attribute)", () => {
  const hass = fakeHass();
  stepClimateTarget(hass, "climate.a", "", 0.5);
  assert.deepEqual(hass.calls, [
    { domain: "climate", service: "set_temperature", data: { entity_id: "climate.a", temperature: 20.5 } },
  ]);
});

test("stepClimateTarget rounds away excess floating-point precision to one decimal", () => {
  const hass = fakeHass();
  stepClimateTarget(hass, "climate.a", 21.3, 0.03);
  assert.deepEqual(hass.calls[0].data.temperature, 21.3);
});
