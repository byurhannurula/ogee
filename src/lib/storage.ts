import { STORAGE_PREFIX } from "./app";

// Single source of truth for chrome.storage keys + typed accessors.
// Avoids scattered string literals across the codebase.

const KEY_DEFAULT_ENABLED = `${STORAGE_PREFIX}-default-enabled`;
const KEY_HOST_OVERRIDES = `${STORAGE_PREFIX}-host-overrides`;
const KEY_THEME = `${STORAGE_PREFIX}-theme`;
const KEY_POSITION = `${STORAGE_PREFIX}-position`;
const KEY_SHOW_VALIDATION = `${STORAGE_PREFIX}-show-validation`;
const KEY_SHOW_TOOLS = `${STORAGE_PREFIX}-show-tools`;

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

// Narrow validators. Failing values are treated as undefined so callers fall
// back to defaults — protects the panel from a corrupted storage entry.
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const isTheme = (v: unknown): v is ThemeMode =>
  typeof v === "string" && (VALID_THEMES as string[]).includes(v);
const isPosition = (v: unknown): v is Position =>
  typeof v === "string" && (VALID_POSITIONS as string[]).includes(v);
const isHostOverrides = (v: unknown): v is HostOverrides =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.values(v as Record<string, unknown>).every(
    (x) => typeof x === "boolean",
  );

const VALIDATORS: { [K in keyof StorageShape]: (v: unknown) => boolean } = {
  [KEY_DEFAULT_ENABLED]: isBool,
  [KEY_HOST_OVERRIDES]: isHostOverrides,
  [KEY_THEME]: isTheme,
  [KEY_POSITION]: isPosition,
  [KEY_SHOW_VALIDATION]: isBool,
  [KEY_SHOW_TOOLS]: isBool,
};

type StorageKey = keyof StorageShape;

function api() {
  // chrome.storage.local is undefined in non-extension contexts (e.g. tests).
  return chrome?.storage?.local;
}

async function get<K extends StorageKey>(
  key: K,
  fallback: StorageShape[K],
): Promise<StorageShape[K]> {
  const local = api();
  if (!local) return fallback;
  const res = await local.get(key);
  const value = res[key];
  if (typeof value === "undefined" || value === null) return fallback;
  return (VALIDATORS[key](value) ? value : fallback) as StorageShape[K];
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
  const KEYS = Object.keys(VALIDATORS) as StorageKey[];
  const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
    const out: Partial<StorageShape> = {};
    for (const key of KEYS) {
      if (!(key in changes)) continue;
      const next = changes[key].newValue;
      // Cleared value or invalid payload → leave key out so consumers fall
      // back to defaults at next read instead of seeing garbage.
      if (next === undefined || next === null) continue;
      if (!VALIDATORS[key](next)) continue;
      (out as Record<string, unknown>)[key] = next;
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
  return get(KEY_THEME, "dark");
}

async function setTheme(v: ThemeMode): Promise<void> {
  await set(KEY_THEME, v);
}

async function getPosition(): Promise<Position> {
  return get(KEY_POSITION, "bottom-left");
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
