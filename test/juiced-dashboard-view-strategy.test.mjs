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

test("person_entities render as a Gezin section with one tile per person, positioned after the hero row", () => {
  const general = { ...GENERAL, person_entities: ["person.joost", "person.leen"] };
  const result = buildView({
    type: "custom:juiced-dashboard-view",
    view: "home",
    general,
    today: { weather_entity: "weather.thuis", waste_entities: [] },
    rooms: [],
  });
  const familySection = result.sections[1];
  assert.equal(familySection.cards[0].heading, "Gezin");
  const personTiles = familySection.cards.slice(1);
  assert.deepEqual(
    personTiles.map((c) => ({ type: c.type, entity: c.entity })),
    [
      { type: "tile", entity: "person.joost" },
      { type: "tile", entity: "person.leen" },
    ],
  );
});

test("no Gezin section when person_entities is empty", () => {
  const result = buildView({ type: "custom:juiced-dashboard-view", view: "home", general: GENERAL, rooms: [] });
  const headings = result.sections.flatMap((s) => s.cards.filter((c) => c.type === "heading").map((c) => c.heading));
  assert.ok(!headings.includes("Gezin"));
});

test("shortcuts render as a Snel naar section with native shortcut cards navigating to their configured path", () => {
  const result = buildView({
    type: "custom:juiced-dashboard-view",
    view: "home",
    general: GENERAL,
    shortcuts: [
      { key: "kia", label: "Auto", icon: "mdi:car-electric", navigation_path: "/kia-ev6" },
      { key: "garden", label: "Tuin", navigation_path: "/dashboard-test/garden" },
    ],
    rooms: [],
  });
  const shortcutsSection = result.sections.find((s) => s.cards.some((c) => c.heading === "Snel naar"));
  assert.ok(shortcutsSection);
  const shortcutCards = shortcutsSection.cards.filter((c) => c.type === "shortcut");
  assert.deepEqual(
    shortcutCards.map((c) => ({ text: c.text, path: c.tap_action.navigation_path, action: c.tap_action.action })),
    [
      { text: "Auto", path: "/kia-ev6", action: "navigate" },
      { text: "Tuin", path: "/dashboard-test/garden", action: "navigate" },
    ],
  );
});

test("no Snel naar section when no shortcuts are configured", () => {
  const result = buildView({ type: "custom:juiced-dashboard-view", view: "home", general: GENERAL, rooms: [] });
  const headings = result.sections.flatMap((s) => s.cards.filter((c) => c.type === "heading").map((c) => c.heading));
  assert.ok(!headings.includes("Snel naar"));
});
