// Discriminated union of messages exchanged between background SW,
// popup, and content script.

export type Message = { type: "toggle-panel" } | { type: "open-panel" };

export { TOGGLE_PANEL_EVENT } from "./app";
