import { beforeEach, describe, expect, it } from "vitest";
import { extractAllMetadata } from "@/lib/metadata";

function setHead(html: string) {
  document.head.innerHTML = html;
}

describe("extractAllMetadata", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    document.title = "";
    document.documentElement.lang = "";
  });

  it("returns empty groups when head is empty", () => {
    const m = extractAllMetadata();
    expect(m.og.hasData).toBe(false);
    expect(m.twitter.hasData).toBe(false);
    expect(m.general.hasData).toBe(false);
    expect(m.links.hasData).toBe(false);
    expect(m.jsonld.hasData).toBe(false);
    expect(m.page.hasData).toBe(true); // page basics always present
  });

  it("collects OG tags from meta[property^=og:]", () => {
    setHead(`
      <meta property="og:title" content="Hello">
      <meta property="og:image" content="https://example.com/i.png">
      <meta property="og:type" content="website">
    `);
    const m = extractAllMetadata();
    expect(m.og.hasData).toBe(true);
    expect(m.og.fields.map((f) => f.key)).toEqual([
      "og:title",
      "og:image",
      "og:type",
    ]);
    expect(m.og.fields[0].value).toBe("Hello");
  });

  it("collects Twitter tags and keeps them out of general", () => {
    setHead(`
      <meta name="twitter:card" content="summary">
      <meta name="twitter:title" content="T">
      <meta name="description" content="d">
    `);
    const m = extractAllMetadata();
    expect(m.twitter.fields.map((f) => f.key)).toEqual([
      "twitter:card",
      "twitter:title",
    ]);
    expect(m.general.fields.map((f) => f.key)).toEqual(["description"]);
  });

  it("ignores meta tags with empty content", () => {
    setHead(`
      <meta property="og:title" content="">
      <meta name="twitter:card" content="   ">
      <meta name="description" content="real">
    `);
    const m = extractAllMetadata();
    expect(m.og.hasData).toBe(false);
    expect(m.twitter.hasData).toBe(false);
    expect(m.general.fields[0]).toEqual({ key: "description", value: "real" });
  });

  it("trims whitespace from content values", () => {
    setHead(`<meta property="og:title" content="   spaced   ">`);
    expect(extractAllMetadata().og.fields[0].value).toBe("spaced");
  });

  it("dedupes high-multiplicity rels (only first preload kept)", () => {
    setHead(`
      <link rel="preload" href="https://example.com/a.css">
      <link rel="preload" href="https://example.com/b.css">
      <link rel="preload" href="https://example.com/c.css">
      <link rel="canonical" href="https://example.com/">
    `);
    const links = extractAllMetadata().links.fields;
    const preloads = links.filter((f) => f.key === "preload");
    expect(preloads).toHaveLength(1);
    expect(preloads[0].value).toBe("https://example.com/a.css");
    expect(links.find((f) => f.key === "canonical")?.value).toBe(
      "https://example.com/",
    );
  });

  it("keeps all occurrences of unknown rels", () => {
    setHead(`
      <link rel="custom-rel" href="https://example.com/x">
      <link rel="custom-rel" href="https://example.com/y">
    `);
    const customs = extractAllMetadata().links.fields.filter(
      (f) => f.key === "custom-rel",
    );
    expect(customs).toHaveLength(2);
  });

  it("extracts JSON-LD @type via regex without parsing", () => {
    setHead(`
      <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "Article", "headline": "x" }
      </script>
      <script type="application/ld+json">{"@type":"Person","name":"y"}</script>
    `);
    const fields = extractAllMetadata().jsonld.fields;
    expect(fields).toHaveLength(2);
    expect(fields[0].key).toBe("Article");
    expect(fields[1].key).toBe("Person");
  });

  it("falls back to JSON-LD N when @type missing or invalid JSON", () => {
    setHead(`
      <script type="application/ld+json">{ "headline": "x" }</script>
      <script type="application/ld+json">not valid json</script>
    `);
    const fields = extractAllMetadata().jsonld.fields;
    expect(fields[0].key).toBe("JSON-LD 1");
    expect(fields[1].key).toBe("JSON-LD 2");
  });

  it("captures page basics from document state", () => {
    document.title = "My Page";
    document.documentElement.lang = "en-US";
    const fieldMap = new Map(
      extractAllMetadata().page.fields.map((f) => [f.key, f.value]),
    );
    expect(fieldMap.get("title")).toBe("My Page");
    expect(fieldMap.get("lang")).toBe("en-US");
    expect(fieldMap.get("url")).toContain("http");
  });

  it("captures <base href> when present", () => {
    setHead(`<base href="https://example.com/app/">`);
    const fieldMap = new Map(
      extractAllMetadata().page.fields.map((f) => [f.key, f.value]),
    );
    expect(fieldMap.get("base")).toBe("https://example.com/app/");
  });
});
