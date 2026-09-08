"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import { compileConfig, compileRoomForCard, createDefaultConfig } from "../dist/juiced-dashboard.js";

test("createDefaultConfig returns a valid, empty-rooms config", () => {
  const config = createDefaultConfig();
  assert.equal(config.type, "custom:juiced-dashboard");
  assert.equal(config.schema_version, 1);
  assert.equal(config.general.start_view, "home");
  assert.equal(config.general.theme_mode, "system");
  assert.deepEqual(config.rooms, []);
});

test("compileConfig never throws on missing/malformed input", () => {
  assert.doesNotThrow(() => compileConfig(undefined));
  assert.doesNotThrow(() => compileConfig(null));
  assert.doesNotThrow(() => compileConfig({}));
  assert.doesNotThrow(() => compileConfig("not an object"));
  assert.doesNotThrow(() => compileConfig(42));
  assert.doesNotThrow(() => compileConfig({ general: "not an object", rooms: "not an array" }));
});

test("compileConfig falls back to defaults for missing general fields", () => {
  const config = compileConfig({ general: { title: "Mijn dashboard" } });
  assert.equal(config.general.title, "Mijn dashboard");
  assert.equal(config.general.start_view, "home");
  assert.equal(config.general.theme_mode, "system");
});

test("compileConfig rejects an invalid start_view/theme_mode and falls back", () => {
  const config = compileConfig({ general: { start_view: "not-a-view", theme_mode: "neon" } });
  assert.equal(config.general.start_view, "home");
  assert.equal(config.general.theme_mode, "system");
});

test("compileConfig keeps a valid start_view/theme_mode", () => {
  const config = compileConfig({ general: { start_view: "rooms", theme_mode: "dark" } });
  assert.equal(config.general.start_view, "rooms");
  assert.equal(config.general.theme_mode, "dark");
});

test("compileConfig drops rooms without a name", () => {
  const config = compileConfig({ rooms: [{ icon: "mdi:sofa" }, { name: "Bureau" }] });
  assert.equal(config.rooms.length, 1);
  assert.equal(config.rooms[0].name, "Bureau");
});

test("compileConfig auto-generates a key for a room that doesn't have one", () => {
  const config = compileConfig({ rooms: [{ name: "Bureau" }] });
  assert.equal(config.rooms.length, 1);
  assert.ok(config.rooms[0].key);
});

test("compileConfig keeps an explicit room key", () => {
  const config = compileConfig({ rooms: [{ key: "bureau", name: "Bureau" }] });
  assert.equal(config.rooms[0].key, "bureau");
});

test("compileConfig treats a non-array rooms value as an empty list", () => {
  const config = compileConfig({ rooms: "nope" });
  assert.deepEqual(config.rooms, []);
});

test("compileRoomForCard expands each single entity into the card's array shape", () => {
  const card = compileRoomForCard({
    key: "bureau",
    name: "Bureau",
    icon: "mdi:desk",
    temperature_entity: "sensor.bureau_temp",
    humidity_entity: "sensor.bureau_hum",
    light_entity: "light.bureau",
    cover_entity: "cover.bureau",
    awning_entity: "cover.luifel_bureau",
    media_player_entity: "media_player.kantoor",
    climate_entity: "climate.daikin_bureau",
  });
  assert.equal(card.name, "Bureau");
  assert.equal(card.icon, "mdi:desk");
  assert.equal(card.temperature, "sensor.bureau_temp");
  assert.equal(card.humidity, "sensor.bureau_hum");
  assert.deepEqual(card.lights, [{ entity: "light.bureau" }]);
  assert.deepEqual(card.covers, [{ entity: "cover.bureau" }]);
  assert.deepEqual(card.awnings, [{ entity: "cover.luifel_bureau" }]);
  assert.equal(card.media_player, "media_player.kantoor");
  assert.equal(card.climate, "climate.daikin_bureau");
});

test("compileRoomForCard leaves categories empty when no entity is configured", () => {
  const card = compileRoomForCard({ key: "toilet", name: "Toilet & berging" });
  assert.deepEqual(card.lights, []);
  assert.deepEqual(card.covers, []);
  assert.deepEqual(card.awnings, []);
  assert.equal(card.media_player, undefined);
  assert.equal(card.climate, undefined);
});
