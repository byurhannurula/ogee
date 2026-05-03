// Single source of truth for chrome.storage keys + typed accessors.
// Avoids scattered "tagpeek-*" string literals across the codebase.

const KEY_DEFAULT_ENABLED = "tagpeek-default-enabled";
const KEY_HOST_OVERRIDES = "tagpeek-host-overrides";
const KEY_THEME = "tagpeek-theme";
const KEY_POSITION = "tagpeek-position";
const KEY_SHOW_VALIDATION = "tagpeek-show-validation";
const KEY_SHOW_TOOLS = "tagpeek-show-tools";

type HostOverrides = Record<string, boolean>;
export type ThemeMode = "auto" | "light" | "dark";
export type Position =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

interface StorageShape {
  [KEY_DEFAULT_ENABLED]: boolean;
  [KEY_HOST_OVERRIDES]: HostOverrides;
  [KEY_THEME]: ThemeMode;
  [KEY_POSITION]: Position;
  [KEY_SHOW_VALIDATION]: boolean;
  [KEY_SHOW_TOOLS]: boolean;
}

const VALID_THEMES: ThemeMode[] = ["auto", "light", "dark"];
const VALID_POSITIONS: Position[] = [
  "bottom-left",
  "bottom-right",
  "top-left",
  "top-right",
];

type StorageKey = keyof StorageShape;

function api() {
  // chrome.storage.local is undefined in non-extension contexts (e.g. tests).
  return chrome?.storage?.local;
}

async function get<K extends StorageKey>(
  key: K,
  fallback: StorageShape[K],
  validate?: (v: unknown) => boolean,
): Promise<StorageShape[K]> {
  const local = api();
  if (!local) return fallback;
  const res = await local.get(key);
  const value = res[key];
  if (typeof value === "undefined" || value === null) return fallback;
  if (validate) {
    return (validate(value) ? value : fallback) as StorageShape[K];
  }
  if (typeof fallback === "boolean") {
    return (typeof value === "boolean" ? value : fallback) as StorageShape[K];
  }
  if (typeof fallback === "object") {
    return (typeof value === "object" ? value : fallback) as StorageShape[K];
  }
  return value as StorageShape[K];
}

async function set<K extends StorageKey>(
  key: K,
  value: StorageShape[K],
): Promise<void> {
  const local = api();
  if (!local) return;
  await local.set({ [key]: value });
}

function onAnyChange(cb: (changes: Partial<StorageShape>) => void): () => void {
  const local = api();
  if (!local) return () => {};
  const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
    const out: Partial<StorageShape> = {};
    if (KEY_DEFAULT_ENABLED in changes) {
      out[KEY_DEFAULT_ENABLED] = changes[KEY_DEFAULT_ENABLED]
        .newValue as boolean;
    }
    if (KEY_HOST_OVERRIDES in changes) {
      out[KEY_HOST_OVERRIDES] = (changes[KEY_HOST_OVERRIDES].newValue ??
        {}) as HostOverrides;
    }
    if (KEY_THEME in changes) {
      out[KEY_THEME] = changes[KEY_THEME].newValue as ThemeMode;
    }
    if (KEY_POSITION in changes) {
      out[KEY_POSITION] = changes[KEY_POSITION].newValue as Position;
    }
    if (KEY_SHOW_VALIDATION in changes) {
      out[KEY_SHOW_VALIDATION] = changes[KEY_SHOW_VALIDATION]
        .newValue as boolean;
    }
    if (KEY_SHOW_TOOLS in changes) {
      out[KEY_SHOW_TOOLS] = changes[KEY_SHOW_TOOLS].newValue as boolean;
    }
    if (Object.keys(out).length) cb(out);
  };
  local.onChanged.addListener(listener);
  return () => local.onChanged.removeListener(listener);
}

async function getDefaultEnabled(): Promise<boolean> {
  return get(KEY_DEFAULT_ENABLED, true);
}

async function setDefaultEnabled(v: boolean): Promise<void> {
  await set(KEY_DEFAULT_ENABLED, v);
}

async function getHostOverrides(): Promise<HostOverrides> {
  return get(KEY_HOST_OVERRIDES, {});
}

async function setHostOverride(
  host: string,
  value: boolean | null,
): Promise<void> {
  const current = await getHostOverrides();
  const next = { ...current };
  if (value === null) delete next[host];
  else next[host] = value;
  await set(KEY_HOST_OVERRIDES, next);
}

async function getEffectiveEnabled(host: string): Promise<boolean> {
  const [defaultEnabled, overrides] = await Promise.all([
    getDefaultEnabled(),
    getHostOverrides(),
  ]);
  return host in overrides ? overrides[host] : defaultEnabled;
}

async function getTheme(): Promise<ThemeMode> {
  return get(
    KEY_THEME,
    "dark",
    (v) => typeof v === "string" && (VALID_THEMES as string[]).includes(v),
  );
}

async function setTheme(v: ThemeMode): Promise<void> {
  await set(KEY_THEME, v);
}

async function getPosition(): Promise<Position> {
  return get(
    KEY_POSITION,
    "bottom-left",
    (v) => typeof v === "string" && (VALID_POSITIONS as string[]).includes(v),
  );
}

async function setPosition(v: Position): Promise<void> {
  await set(KEY_POSITION, v);
}

async function getShowValidation(): Promise<boolean> {
  return get(KEY_SHOW_VALIDATION, false);
}

async function setShowValidation(v: boolean): Promise<void> {
  await set(KEY_SHOW_VALIDATION, v);
}

async function getShowTools(): Promise<boolean> {
  return get(KEY_SHOW_TOOLS, false);
}

async function setShowTools(v: boolean): Promise<void> {
  await set(KEY_SHOW_TOOLS, v);
}

export const storage = {
  getDefaultEnabled,
  setDefaultEnabled,
  getHostOverrides,
  setHostOverride,
  getEffectiveEnabled,
  getTheme,
  setTheme,
  getPosition,
  setPosition,
  getShowValidation,
  setShowValidation,
  getShowTools,
  setShowTools,
  onAnyChange,
};
