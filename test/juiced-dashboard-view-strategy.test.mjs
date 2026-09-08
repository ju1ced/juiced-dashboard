"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import { buildView } from "../dist/juiced-dashboard.js";

const GENERAL = { title: "Ons Huis", start_view: "home", theme_mode: "system", person_entities: [] };

test("buildView gives every section a column_span matching max_columns, so each always claims the full computed row width", () => {
  const result = buildView({
    type: "custom:juiced-dashboard-view",
    view: "home",
    general: GENERAL,
    today: { weather_entity: "weather.thuis", waste_entities: [] },
    quick_actions: [{ key: "a", label: "A", entity: "light.a", service: "toggle" }],
    rooms: [{ key: "bureau", name: "Bureau", light_entities: [], cover_entities: [], awning_entities: [] }],
  });
  for (const section of result.sections) {
    assert.equal(section.column_span, result.max_columns);
  }
});

test("Vandaag and Security merge into one section with a shared 2-column grid card when both are configured", () => {
  const result = buildView({
    type: "custom:juiced-dashboard-view",
    view: "home",
    general: GENERAL,
    today: { weather_entity: "weather.thuis", waste_entities: [] },
    security: { alarm_entity: "alarm_control_panel.huis", cameras: [] },
    rooms: [],
  });
  const heroSection = result.sections[0];
  assert.equal(heroSection.cards.length, 1);
  const innerGrid = heroSection.cards[0];
  assert.equal(innerGrid.type, "grid");
  assert.equal(innerGrid.columns, 2);
  assert.deepEqual(
    innerGrid.cards.map((c) => c.type),
    ["custom:juiced-dashboard-today-card", "custom:juiced-dashboard-security-card"],
  );
});

test("only Security configured renders a single card with no forced 2-column grid", () => {
  const result = buildView({
    type: "custom:juiced-dashboard-view",
    view: "home",
    general: GENERAL,
    security: { alarm_entity: "alarm_control_panel.huis", cameras: [] },
    rooms: [],
  });
  const heroSection = result.sections[0];
  assert.equal(heroSection.cards.length, 1);
  assert.equal(heroSection.cards[0].type, "custom:juiced-dashboard-security-card");
});

test("neither Vandaag nor Security configured omits the hero section entirely", () => {
  const result = buildView({ type: "custom:juiced-dashboard-view", view: "home", general: GENERAL, rooms: [] });
  const sectionCardTypes = result.sections.flatMap((s) => s.cards.map((c) => c.type));
  assert.ok(!sectionCardTypes.includes("custom:juiced-dashboard-today-card"));
  assert.ok(!sectionCardTypes.includes("custom:juiced-dashboard-security-card"));
});

test("every top-level card gets grid_options: {columns: full} so it claims the whole section width", () => {
  const result = buildView({
    type: "custom:juiced-dashboard-view",
    view: "home",
    general: GENERAL,
    today: { weather_entity: "weather.thuis", waste_entities: [] },
    security: { alarm_entity: "alarm_control_panel.huis", cameras: [] },
    quick_actions: [{ key: "a", label: "A", entity: "light.a", service: "toggle" }],
    rooms: [{ key: "bureau", name: "Bureau", light_entities: [], cover_entities: [], awning_entities: [] }],
  });
  const [heroSection, quickActionsSection, roomsSection] = result.sections;
  assert.deepEqual(heroSection.cards[0].grid_options, { columns: "full" });
  assert.deepEqual(quickActionsSection.cards[0].grid_options, { columns: "full" });
  assert.deepEqual(roomsSection.cards[0].grid_options, { columns: "full" });
});

test("room detail subview card also gets grid_options: {columns: full}", () => {
  const result = buildView({
    type: "custom:juiced-dashboard-view",
    view: "room",
    general: GENERAL,
    room: { key: "bureau", name: "Bureau", light_entities: [], cover_entities: [], awning_entities: [] },
  });
  assert.deepEqual(result.sections[0].cards[0].grid_options, { columns: "full" });
});

test("person_entities render as badges on Home but not on other views", () => {
  const general = { ...GENERAL, person_entities: ["person.joost", "person.leen"] };
  const home = buildView({ type: "custom:juiced-dashboard-view", view: "home", general, rooms: [] });
  assert.deepEqual(
    home.badges.map((b) => b.entity),
    ["person.joost", "person.leen"],
  );
  const rooms = buildView({ type: "custom:juiced-dashboard-view", view: "rooms", general, rooms: [] });
  assert.equal(rooms.badges, undefined);
});
