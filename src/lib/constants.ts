import type { MetaData } from "./metadata";

export type TabKey = keyof Omit<MetaData, "page">;

export const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: "og", label: "OG" },
  { key: "twitter", label: "Twitter" },
  { key: "general", label: "Meta" },
  { key: "links", label: "Links" },
  { key: "jsonld", label: "JSON-LD" },
];
