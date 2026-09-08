"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import { buildView } from "../dist/juiced-dashboard.js";

const GENERAL = { title: "Ons Huis", start_view: "home", theme_mode: "system", person_entities: [] };

test("buildView uses max_columns 1 so every section spans the full row", () => {
  const result = buildView({ type: "custom:juiced-dashboard-view", view: "home", general: GENERAL, rooms: [] });
  assert.equal(result.max_columns, 1);
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
