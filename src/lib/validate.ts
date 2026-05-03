import type { MetaData } from "./metadata";

export type Severity = "error" | "warn";

export interface Issue {
  severity: Severity;
  group: "og" | "twitter" | "general";
  key: string;
  message: string;
}

export interface ValidationResult {
  issues: Issue[];
  errorCount: number;
  warnCount: number;
  // Quick lookup for inline marks: `${group}:${key}` → severity.
  byField: Map<string, Severity>;
}

// Required tags per the Open Graph protocol. https://ogp.me/#metadata
const OG_REQUIRED = ["og:title", "og:type", "og:image", "og:url"] as const;
const OG_RECOMMENDED = ["og:description", "og:site_name"] as const;

// Twitter Cards minimum viable set when any twitter:* tag is present.
// twitter:title is optional if og:title exists; same for description/image.
const TWITTER_REQUIRED = ["twitter:card"] as const;
const TWITTER_RECOMMENDED = [
  "twitter:title",
  "twitter:description",
  "twitter:image",
] as const;

const VALID_TWITTER_CARDS = new Set([
  "summary",
  "summary_large_image",
  "app",
  "player",
]);

const VALID_OG_TYPES = new Set([
  "website",
  "article",
  "book",
  "profile",
  "music.song",
  "music.album",
  "music.playlist",
  "music.radio_station",
  "video.movie",
  "video.episode",
  "video.tv_show",
  "video.other",
]);

function fieldMap(fields: { key: string; value: string }[]) {
  const m = new Map<string, string>();
  for (const f of fields) m.set(f.key, f.value);
  return m;
}

function isAbsoluteUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function validate(metadata: MetaData): ValidationResult {
  const issues: Issue[] = [];
  const og = fieldMap(metadata.og.fields);
  const tw = fieldMap(metadata.twitter.fields);
  const general = fieldMap(metadata.general.fields);

  // OG required
  for (const key of OG_REQUIRED) {
    if (!og.has(key))
      issues.push({
        severity: "error",
        group: "og",
        key,
        message: `Missing required ${key}`,
      });
  }
  // OG recommended
  for (const key of OG_RECOMMENDED) {
    if (!og.has(key))
      issues.push({
        severity: "warn",
        group: "og",
        key,
        message: `Missing recommended ${key}`,
      });
  }
  // OG type validity (warn — extension types are common)
  const ogType = og.get("og:type");
  if (ogType && !VALID_OG_TYPES.has(ogType) && !ogType.includes(":")) {
    issues.push({
      severity: "warn",
      group: "og",
      key: "og:type",
      message: `Unrecognized og:type "${ogType}"`,
    });
  }
  // OG url should be absolute
  const ogUrl = og.get("og:url");
  if (ogUrl && !isAbsoluteUrl(ogUrl)) {
    issues.push({
      severity: "error",
      group: "og",
      key: "og:url",
      message: "og:url must be an absolute URL",
    });
  }
  // OG image should be absolute
  const ogImage = og.get("og:image");
  if (ogImage && !isAbsoluteUrl(ogImage)) {
    issues.push({
      severity: "error",
      group: "og",
      key: "og:image",
      message: "og:image must be an absolute URL",
    });
  }

  // Twitter — only validate if any twitter:* tag is present
  if (metadata.twitter.hasData) {
    for (const key of TWITTER_REQUIRED) {
      if (!tw.has(key))
        issues.push({
          severity: "error",
          group: "twitter",
          key,
          message: `Missing required ${key}`,
        });
    }
    const card = tw.get("twitter:card");
    if (card && !VALID_TWITTER_CARDS.has(card)) {
      issues.push({
        severity: "error",
        group: "twitter",
        key: "twitter:card",
        message: `Invalid twitter:card "${card}"`,
      });
    }
    // Recommended fall back to OG counterparts if missing.
    for (const key of TWITTER_RECOMMENDED) {
      if (tw.has(key)) continue;
      const ogCounterpart = key.replace("twitter:", "og:");
      if (og.has(ogCounterpart)) continue;
      issues.push({
        severity: "warn",
        group: "twitter",
        key,
        message: `Missing ${key} (no og counterpart either)`,
      });
    }
  }

  // General: description / title fallback (warn)
  if (!og.has("og:description") && !general.has("description")) {
    issues.push({
      severity: "warn",
      group: "general",
      key: "description",
      message: "No description (og:description or meta description)",
    });
  }

  const byField = new Map<string, Severity>();
  for (const issue of issues) {
    const k = `${issue.group}:${issue.key}`;
    // error wins over warn if the same field is flagged twice.
    const prev = byField.get(k);
    if (prev !== "error") byField.set(k, issue.severity);
  }

  let errorCount = 0;
  let warnCount = 0;
  for (const i of issues) {
    if (i.severity === "error") errorCount++;
    else warnCount++;
  }

  return { issues, errorCount, warnCount, byField };
}
