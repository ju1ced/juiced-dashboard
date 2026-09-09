"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import { buildView } from "../dist/juiced-dashboard.js";

const GENERAL = { title: "Ons Huis", start_view: "home", theme_mode: "system", person_entities: [] };

function homeView(overrides) {
  return buildView({ type: "custom:juiced-dashboard-view", view: "home", general: GENERAL, rooms: [], ...overrides });
}

test("buildView gives every top-level section a column_span matching max_columns, so each always claims the full computed row width", () => {
  const result = homeView({
    today: { weather_entity: "weather.thuis", waste_entities: [] },
    quick_actions: [{ key: "a", label: "A", entity: "light.a", service: "toggle" }],
    rooms: [{ key: "bureau", name: "Bureau", light_entities: [], cover_entities: [], awning_entities: [] }],
  });
  for (const section of result.sections) {
    assert.equal(section.column_span, result.max_columns);
  }
});

test("Vandaag and Security merge into one section with a shared 2-column grid, each side in its own vertical-stack", () => {
  const result = homeView({
    today: { weather_entity: "weather.thuis", waste_entities: [] },
    security: { alarm_entity: "alarm_control_panel.huis", cameras: [] },
  });
  const heroSection = result.sections[0];
  assert.equal(heroSection.cards.length, 1);
  const innerGrid = heroSection.cards[0];
  assert.equal(innerGrid.type, "grid");
  assert.equal(innerGrid.columns, 2);
  const [leftStack, rightStack] = innerGrid.cards;
  assert.equal(leftStack.type, "vertical-stack");
  assert.deepEqual(
    leftStack.cards.map((c) => c.type),
    ["custom:juiced-dashboard-today-card"],
  );
  assert.equal(rightStack.type, "vertical-stack");
  assert.deepEqual(
    rightStack.cards.map((c) => c.type),
    ["custom:juiced-dashboard-security-card"],
  );
});

test("only Security configured renders a single card with no forced 2-column grid", () => {
  const result = homeView({ security: { alarm_entity: "alarm_control_panel.huis", cameras: [] } });
  const heroSection = result.sections[0];
  assert.equal(heroSection.cards.length, 1);
  assert.equal(heroSection.cards[0].type, "custom:juiced-dashboard-security-card");
});

test("neither Vandaag, Security, Gezin nor Snel naar configured omits the hero section entirely", () => {
  const result = homeView({});
  const sectionCardTypes = result.sections.flatMap((s) => s.cards.map((c) => c.type));
  assert.ok(!sectionCardTypes.includes("custom:juiced-dashboard-today-card"));
  assert.ok(!sectionCardTypes.includes("custom:juiced-dashboard-security-card"));
});

test("every top-level card gets grid_options: {columns: full} so it claims the whole section width", () => {
  const result = homeView({
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

test("Gezin and Snel naar stack into the left column next to Security, filling the gap instead of forming their own rows", () => {
  const result = homeView({
    general: { ...GENERAL, person_entities: ["person.joost", "person.leen"] },
    today: { weather_entity: "weather.thuis", waste_entities: [] },
    security: { alarm_entity: "alarm_control_panel.huis", cameras: [] },
    shortcuts: [{ key: "kia", label: "Auto", icon: "mdi:car-electric", navigation_path: "/kia-ev6" }],
  });
  const innerGrid = result.sections[0].cards[0];
  const [leftStack] = innerGrid.cards;
  assert.deepEqual(
    leftStack.cards.map((c) => c.type ?? c.heading),
    ["custom:juiced-dashboard-today-card", "heading", "grid", "heading", "grid"],
  );
  const [, gezinHeading, gezinTiles, snelNaarHeading, snelNaarButtons] = leftStack.cards;
  assert.equal(gezinHeading.heading, "Gezin");
  assert.deepEqual(
    gezinTiles.cards.map((c) => ({ type: c.type, entity: c.entity })),
    [
      { type: "tile", entity: "person.joost" },
      { type: "tile", entity: "person.leen" },
    ],
  );
  assert.equal(snelNaarHeading.heading, "Snel naar");
  assert.deepEqual(snelNaarButtons.cards[0], {
    type: "shortcut",
    label: "Auto",
    icon: "mdi:car-electric",
    tap_action: { action: "navigate", navigation_path: "/kia-ev6" },
  });
});

test("Gezin alone (no Vandaag/Security/Snel naar) still renders as its own full-width stack, not a forced empty 2-column grid", () => {
  const result = homeView({ general: { ...GENERAL, person_entities: ["person.joost"] } });
  const heroSection = result.sections[0];
  const stack = heroSection.cards[0];
  assert.equal(stack.type, "vertical-stack");
  assert.equal(stack.cards[0].heading, "Gezin");
});

test("no Gezin or Snel naar content when neither person_entities nor shortcuts are configured", () => {
  const result = homeView({ today: { weather_entity: "weather.thuis", waste_entities: [] } });
  const heroSection = result.sections[0];
  assert.equal(heroSection.cards[0].type, "custom:juiced-dashboard-today-card");
});
