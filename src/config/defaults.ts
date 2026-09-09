import { CONFIG_SCHEMA_VERSION, type JuicedDashboardConfigV1 } from "./types";

export function createDefaultConfig(): JuicedDashboardConfigV1 {
  return {
    type: "custom:juiced-dashboard",
    schema_version: CONFIG_SCHEMA_VERSION,
    general: {
      title: "Juiced Dashboard",
      start_view: "home",
      theme_mode: "system",
      person_entities: [],
    },
    today: {
      waste_entities: [],
    },
    quick_actions: [],
    security: {
      cameras: [],
    },
    shortcuts: [],
    rooms: [],
  };
}
