"use strict";

import test from "node:test";
import assert from "node:assert/strict";

import { daysUntil, parseWasteDate, relativeWasteLabel } from "../dist/juiced-dashboard.js";

test("parseWasteDate parses DD-MM-YYYY", () => {
  const date = parseWasteDate("09-09-2026");
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 8);
  assert.equal(date.getDate(), 9);
});

test("parseWasteDate parses YYYY-MM-DD", () => {
  const date = parseWasteDate("2026-09-09");
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 8);
  assert.equal(date.getDate(), 9);
});

test("parseWasteDate returns null for unparseable input", () => {
  assert.equal(parseWasteDate("not a date"), null);
  assert.equal(parseWasteDate(""), null);
});

test("daysUntil counts whole calendar days regardless of time-of-day", () => {
  const now = new Date(2026, 8, 9, 23, 0, 0);
  assert.equal(daysUntil(new Date(2026, 8, 9, 1, 0, 0), now), 0);
  assert.equal(daysUntil(new Date(2026, 8, 10), now), 1);
  assert.equal(daysUntil(new Date(2026, 8, 8), now), -1);
  assert.equal(daysUntil(new Date(2026, 8, 12), now), 3);
});

test("relativeWasteLabel renders the expected Dutch labels", () => {
  assert.equal(relativeWasteLabel(0), "Vandaag");
  assert.equal(relativeWasteLabel(1), "Morgen");
  assert.equal(relativeWasteLabel(3), "Over 3 dagen");
  assert.equal(relativeWasteLabel(-1), "Gisteren");
  assert.equal(relativeWasteLabel(-2), "2 dagen geleden");
});
