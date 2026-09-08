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

test("compileConfig defaults today to an empty waste list and no entities", () => {
  const config = compileConfig({});
  assert.deepEqual(config.today, { waste_entities: [] });
});

test("compileConfig keeps configured today entities and filters the waste list to strings", () => {
  const config = compileConfig({
    today: {
      weather_entity: "weather.thuis",
      solar_power_entity: "sensor.solar",
      waste_entities: ["sensor.gft", 42, null, "sensor.restafval"],
    },
  });
  assert.equal(config.today.weather_entity, "weather.thuis");
  assert.equal(config.today.solar_power_entity, "sensor.solar");
  assert.equal(config.today.battery_soc_entity, undefined);
  assert.deepEqual(config.today.waste_entities, ["sensor.gft", "sensor.restafval"]);
});

test("compileConfig treats a non-array today.waste_entities as empty", () => {
  const config = compileConfig({ today: { waste_entities: "not an array" } });
  assert.deepEqual(config.today.waste_entities, []);
});

test("compileConfig drops quick actions missing an entity or service", () => {
  const config = compileConfig({
    quick_actions: [
      { key: "a", label: "Alarm", entity: "alarm_control_panel.huis", service: "alarm_arm_home" },
      { key: "b", label: "Geen entiteit", service: "toggle" },
      { key: "c", label: "Geen service", entity: "light.x" },
    ],
  });
  assert.equal(config.quick_actions.length, 1);
  assert.equal(config.quick_actions[0].key, "a");
  assert.equal(config.quick_actions[0].entity, "alarm_control_panel.huis");
  assert.equal(config.quick_actions[0].service, "alarm_arm_home");
});

test("compileConfig falls back to the entity id as the quick action label when none is given", () => {
  const config = compileConfig({ quick_actions: [{ entity: "light.garage", service: "toggle" }] });
  assert.equal(config.quick_actions[0].label, "light.garage");
  assert.ok(config.quick_actions[0].key);
});

test("compileConfig defaults security to no alarm and no cameras", () => {
  const config = compileConfig({});
  assert.deepEqual(config.security, { cameras: [] });
});

test("compileConfig keeps a configured alarm entity", () => {
  const config = compileConfig({ security: { alarm_entity: "alarm_control_panel.huis" } });
  assert.equal(config.security.alarm_entity, "alarm_control_panel.huis");
});

test("compileConfig drops cameras missing a name or camera_entity", () => {
  const config = compileConfig({
    security: {
      cameras: [
        { key: "oprit", name: "Oprit", camera_entity: "camera.oprit" },
        { name: "Geen entiteit" },
        { camera_entity: "camera.zonder_naam" },
      ],
    },
  });
  assert.equal(config.security.cameras.length, 1);
  assert.equal(config.security.cameras[0].key, "oprit");
});

test("compileConfig keeps a camera's optional privacy fields only when configured", () => {
  const config = compileConfig({
    security: {
      cameras: [
        { name: "Oprit", camera_entity: "camera.oprit" },
        { name: "Tuin", camera_entity: "camera.tuin", privacy_entity: "switch.tuin_privacy", privacy_service: "toggle" },
      ],
    },
  });
  assert.equal(config.security.cameras[0].privacy_entity, undefined);
  assert.equal(config.security.cameras[1].privacy_entity, "switch.tuin_privacy");
  assert.equal(config.security.cameras[1].privacy_service, "toggle");
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

test("compileConfig defaults general.person_entities to an empty list", () => {
  const config = compileConfig({});
  assert.deepEqual(config.general.person_entities, []);
});

test("compileConfig filters general.person_entities to strings", () => {
  const config = compileConfig({ general: { person_entities: ["person.joost", 42, null, "person.leen"] } });
  assert.deepEqual(config.general.person_entities, ["person.joost", "person.leen"]);
});

test("compileConfig keeps a valid room zone", () => {
  const config = compileConfig({ rooms: [{ name: "Bureau", zone: "gelijkvloers" }] });
  assert.equal(config.rooms[0].zone, "gelijkvloers");
});

test("compileConfig drops an invalid room zone instead of keeping garbage", () => {
  const config = compileConfig({ rooms: [{ name: "Bureau", zone: "kelder" }] });
  assert.equal(config.rooms[0].zone, undefined);
});

test("compileConfig leaves a room's zone undefined when not configured", () => {
  const config = compileConfig({ rooms: [{ name: "Bureau" }] });
  assert.equal(config.rooms[0].zone, undefined);
});

test("compileRoomForCard carries the zone through to the card shape", () => {
  const card = compileRoomForCard({ key: "bureau", name: "Bureau", zone: "boven" });
  assert.equal(card.zone, "boven");
});
