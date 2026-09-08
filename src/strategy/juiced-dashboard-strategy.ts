/**
 * Home Assistant dashboard strategy for `custom:juiced-dashboard`.
 *
 * This is Home Assistant's own dashboard-strategy contract (any HACS
 * dashboard strategy uses the same three hooks: `generate`,
 * `getConfigElement`, `getCreateSuggestions`, plus a `window.customStrategies`
 * registration) — not something invented by any particular project. Building
 * one here is what makes "Juiced Dashboard" appear under Community-dashboards
 * in Home Assistant's own "+ Add Dashboard" picker.
 */

import { compileConfig } from "../config/compiler";
import { VIEW_PATHS, type JuicedDashboardConfigV1, type ViewPath } from "../config/types";

interface StrategyMetadata {
  type: string;
  strategyType: "dashboard";
  name: string;
  description: string;
  documentationURL: string;
}

declare global {
  interface Window {
    customStrategies?: StrategyMetadata[];
  }
}

const HTMLElementBase = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

const VIEW_METADATA: Record<ViewPath, { title: string; icon: string }> = {
  home: { title: "Home", icon: "mdi:home" },
  rooms: { title: "Kamers", icon: "mdi:floor-plan" },
  energy: { title: "Energie", icon: "mdi:lightning-bolt" },
  domains: { title: "Domeinen", icon: "mdi:view-grid-outline" },
  more: { title: "Meer", icon: "mdi:dots-horizontal-circle-outline" },
};

export function roomPath(key: string): string {
  return `room-${key}`;
}

function createView(path: ViewPath, config: JuicedDashboardConfigV1): Record<string, unknown> {
  const meta = VIEW_METADATA[path];
  return {
    title: meta.title,
    path,
    icon: meta.icon,
    subview: false,
    strategy: {
      type: "custom:juiced-dashboard-view",
      view: path,
      general: config.general,
      rooms: config.rooms,
    },
  };
}

function createRoomView(room: JuicedDashboardConfigV1["rooms"][number], config: JuicedDashboardConfigV1): Record<string, unknown> {
  return {
    title: room.name,
    path: roomPath(room.key),
    icon: room.icon || "mdi:sofa-outline",
    subview: true,
    back_path: "rooms",
    strategy: {
      type: "custom:juiced-dashboard-view",
      view: "room",
      general: config.general,
      room,
    },
  };
}

export class JuicedDashboardStrategy extends HTMLElementBase {
  static getCreateSuggestions(): { title: string; icon: string } {
    return { title: "Juiced Dashboard", icon: "mdi:home-assistant" };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("juiced-dashboard-strategy-editor");
  }

  static async generate(input: unknown): Promise<Record<string, unknown>> {
    const config = compileConfig(input);
    const orderedPaths: ViewPath[] = [config.general.start_view, ...VIEW_PATHS.filter((path) => path !== config.general.start_view)];
    return {
      title: config.general.title,
      views: [...orderedPaths.map((path) => createView(path, config)), ...config.rooms.map((room) => createRoomView(room, config))],
    };
  }
}

export function registerJuicedDashboardStrategy(): void {
  if (typeof customElements === "undefined" || typeof window === "undefined") return;
  const tag = "ll-strategy-dashboard-juiced-dashboard";
  if (!customElements.get(tag)) customElements.define(tag, JuicedDashboardStrategy);
  window.customStrategies ??= [];
  if (!window.customStrategies.some((strategy) => strategy.type === "juiced-dashboard" && strategy.strategyType === "dashboard")) {
    window.customStrategies.push({
      type: "juiced-dashboard",
      strategyType: "dashboard",
      name: "Juiced Dashboard",
      description: "Kia-geïnspireerd, GUI-geconfigureerd dashboard: Home, Kamers, Energie, Domeinen en Meer.",
      documentationURL: "https://github.com/ju1ced/juiced-dashboard",
    });
  }
}
