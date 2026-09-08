/**
 * Juiced Dashboard — HACS resource entry point.
 * Bundled by scripts/build.mjs into dist/juiced-dashboard.js and installed
 * via HACS as a custom repository (category: Dashboard / plugin).
 *
 * Re-exports every pure helper and service-call action so the built bundle
 * doubles as the test target (see test/) — importing straight from the
 * compiled `dist/juiced-dashboard.js` avoids needing a TypeScript loader
 * just to run `node --test`.
 */

import { registerJuicedDashboardRoomCard } from "./cards/juiced-dashboard-room-card";
import { registerJuicedDashboardStrategy } from "./strategy/juiced-dashboard-strategy";
import { registerJuicedDashboardViewStrategy } from "./strategy/juiced-dashboard-view-strategy";
import { registerJuicedDashboardEditor } from "./editor/juiced-dashboard-editor";

export {
  closeCover,
  collectEntityIds,
  coverPosition,
  coverPositionLabel,
  DEFAULT_CLIMATE_TARGET,
  displayName,
  entityState,
  escapeHtml,
  formatNumber,
  formatTemp,
  hasRelevantChange,
  humanize,
  hvacModeLabel,
  isUnavailable,
  JuicedDashboardRoomCard,
  openCover,
  registerJuicedDashboardRoomCard,
  roomEntityIds,
  roomFlag,
  roomHasControls,
  roomIconSvg,
  roomLightsOn,
  roomStatLine,
  setHvacMode,
  stepClimateTarget,
  stopCover,
  toggleLight,
  toggleMediaPlayPause,
} from "./cards/juiced-dashboard-room-card";
export type { HassEntity, HomeAssistant, JuicedDashboardRoomCardConfig, RoomConfig, RoomCoverConfig, RoomLightConfig } from "./cards/juiced-dashboard-room-card";

export { compileConfig, compileRoomForCard } from "./config/compiler";
export { createDefaultConfig } from "./config/defaults";
export { CONFIG_SCHEMA_VERSION, START_VIEWS, THEME_MODES, VIEW_PATHS } from "./config/types";
export type {
  CameraConfig,
  EditorRoomConfig,
  GeneralConfig,
  JuicedDashboardConfigV1,
  QuickActionConfig,
  SecurityConfig,
  StartView,
  ThemeMode,
  TodayConfig,
  ViewPath,
} from "./config/types";

export { JuicedDashboardStrategy, registerJuicedDashboardStrategy, roomPath } from "./strategy/juiced-dashboard-strategy";
export { buildView, JuicedDashboardViewStrategy, registerJuicedDashboardViewStrategy } from "./strategy/juiced-dashboard-view-strategy";
export type { JuicedDashboardViewConfig } from "./strategy/juiced-dashboard-view-strategy";
export { JuicedDashboardStrategyEditor, registerJuicedDashboardEditor } from "./editor/juiced-dashboard-editor";
export { JuicedDashboardTodayCard, registerJuicedDashboardTodayCard } from "./cards/juiced-dashboard-today-card";
export type { JuicedDashboardTodayCardConfig } from "./cards/juiced-dashboard-today-card";
export { JuicedDashboardQuickActions, registerJuicedDashboardQuickActions } from "./cards/juiced-dashboard-quick-actions";
export type { JuicedDashboardQuickActionsConfig } from "./cards/juiced-dashboard-quick-actions";
export { JuicedDashboardSecurityCard, registerJuicedDashboardSecurityCard } from "./cards/juiced-dashboard-security-card";
export type { JuicedDashboardSecurityCardConfig } from "./cards/juiced-dashboard-security-card";

declare const __JUICED_DASHBOARD_VERSION__: string;

export interface JuicedDashboardBuildInfo {
  readonly name: "Juiced Dashboard";
  readonly version: string;
}

declare global {
  interface Window {
    __JUICED_DASHBOARD_BUILD__?: JuicedDashboardBuildInfo;
  }
}

export const buildInfo: JuicedDashboardBuildInfo = Object.freeze({
  name: "Juiced Dashboard",
  version: typeof __JUICED_DASHBOARD_VERSION__ === "undefined" ? "dev" : __JUICED_DASHBOARD_VERSION__,
});

if (typeof window !== "undefined") {
  registerJuicedDashboardRoomCard();
  registerJuicedDashboardEditor();
  registerJuicedDashboardViewStrategy();
  registerJuicedDashboardStrategy();
  window.__JUICED_DASHBOARD_BUILD__ = buildInfo;
  // eslint-disable-next-line no-console
  console.info(
    "%c JUICED DASHBOARD %c " + buildInfo.version,
    "color: #081018; background: #5cc8ff; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;",
    "color: #5cc8ff; background: #0f1115; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;",
  );
}
