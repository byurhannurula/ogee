// Discriminated union of messages exchanged between background SW,
// popup, and content script.

export type Message = { type: "toggle-panel" } | { type: "open-panel" };

export const TOGGLE_PANEL_EVENT = "tagpeek:toggle-panel";
