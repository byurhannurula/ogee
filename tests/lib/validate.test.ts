import { describe, expect, it } from "vitest";
import { validate } from "@/lib/validate";
import type { MetaData } from "@/lib/metadata";

function buildMeta(overrides: {
  og?: Record<string, string>;
  twitter?: Record<string, string>;
  general?: Record<string, string>;
}): MetaData {
  const og = overrides.og ?? {};
  const tw = overrides.twitter ?? {};
  const gen = overrides.general ?? {};
  const toFields = (obj: Record<string, string>) =>
    Object.entries(obj).map(([key, value]) => ({ key, value }));
  return {
    og: {
      name: "Open Graph",
      fields: toFields(og),
      hasData: Object.keys(og).length > 0,
    },
    twitter: {
      name: "Twitter",
      fields: toFields(tw),
      hasData: Object.keys(tw).length > 0,
    },
    general: {
      name: "General",
      fields: toFields(gen),
      hasData: Object.keys(gen).length > 0,
    },
    links: { name: "Links", fields: [], hasData: false },
    jsonld: { name: "JSON-LD", fields: [], hasData: false },
    page: { name: "Page", fields: [], hasData: false },
  };
}

describe("validate", () => {
  it("flags all required OG fields when missing", () => {
    const result = validate(buildMeta({}));
    const ogErrors = result.issues.filter(
      (i) => i.group === "og" && i.severity === "error",
    );
    const ogKeys = ogErrors.map((i) => i.key).sort();
    expect(ogKeys).toEqual(["og:image", "og:title", "og:type", "og:url"]);
  });

  it("does not flag OG fields that are present", () => {
    const result = validate(
      buildMeta({
        og: {
          "og:title": "T",
          "og:type": "website",
          "og:image": "https://example.com/i.png",
          "og:url": "https://example.com/",
          "og:description": "d",
          "og:site_name": "s",
        },
      }),
    );
    expect(result.errorCount).toBe(0);
  });

  it("warns on missing recommended OG fields", () => {
    const result = validate(
      buildMeta({
        og: {
          "og:title": "T",
          "og:type": "website",
          "og:image": "https://example.com/i.png",
          "og:url": "https://example.com/",
        },
      }),
    );
    const recommendedWarns = result.issues
      .filter((i) => i.severity === "warn" && i.group === "og")
      .map((i) => i.key)
      .sort();
    expect(recommendedWarns).toContain("og:description");
    expect(recommendedWarns).toContain("og:site_name");
  });

  it("flags relative og:url and og:image as errors", () => {
    const result = validate(
      buildMeta({
        og: {
          "og:title": "T",
          "og:type": "website",
          "og:image": "/i.png",
          "og:url": "/page",
        },
      }),
    );
    const errorKeys = result.issues
      .filter((i) => i.severity === "error")
      .map((i) => i.key);
    expect(errorKeys).toContain("og:url");
    expect(errorKeys).toContain("og:image");
  });

  it("only validates twitter when twitter:* tags exist", () => {
    const noTw = validate(buildMeta({}));
    expect(noTw.issues.find((i) => i.group === "twitter")).toBeUndefined();

    const withTw = validate(buildMeta({ twitter: { "twitter:title": "T" } }));
    const twErrors = withTw.issues.filter(
      (i) => i.group === "twitter" && i.severity === "error",
    );
    expect(twErrors.find((i) => i.key === "twitter:card")).toBeTruthy();
  });

  it("rejects invalid twitter:card values", () => {
    const result = validate(
      buildMeta({ twitter: { "twitter:card": "weird-card" } }),
    );
    const cardError = result.issues.find(
      (i) => i.key === "twitter:card" && i.severity === "error",
    );
    expect(cardError?.message).toContain("Invalid");
  });

  it("does not warn about twitter:title when og:title is present", () => {
    const result = validate(
      buildMeta({
        og: { "og:title": "T" },
        twitter: { "twitter:card": "summary" },
      }),
    );
    const twTitleWarn = result.issues.find(
      (i) => i.group === "twitter" && i.key === "twitter:title",
    );
    expect(twTitleWarn).toBeUndefined();
  });

  it("byField map is keyed as `group:key`", () => {
    const result = validate(buildMeta({}));
    expect(result.byField.get("og:og:title")).toBe("error");
    expect(result.byField.get("og:og:description")).toBe("warn");
  });
});
