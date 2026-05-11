// App-wide constants. Single source of truth for names, IDs, URLs, and prefixes.

export const APP_NAME = "OGee";
export const APP_VERSION = "1.0.0";
export const AUTHOR_NAME = "Byurhan Nurula";
export const AUTHOR_EMAIL = "ogee@byurhannurula.com";
export const REPO_URL = "https://github.com/byurhannurula/ogee";

// Extension IDs and prefixes
export const STORAGE_PREFIX = "ogee";
export const FIREFOX_GECKO_ID = "ogee@byurhannurula.com";
export const RELOAD_PATH = "/__ogee_reload";

// DOM IDs and event names
export const HOST_ELEMENT_ID = "ogee-host";
export const TAB_PANEL_ID = "ogee-tabpanel";
export const TOGGLE_PANEL_EVENT = "ogee:toggle-panel";
export const NAV_EVENT = "ogee:nav";
export const PATCH_FLAG = Symbol.for("ogee-history-patched");

// Console / debug prefixes
export const SW_LOG_PREFIX = "[OGee SW]";
export const DEV_RELOAD_PENDING_KEY = "ogee-dev-reload-pending";
