export interface MetaField {
  key: string;
  value: string;
}

export interface MetaGroup {
  name: string;
  fields: MetaField[];
  hasData: boolean;
}

// Rels we expect to appear many times on a page (preload/prefetch/etc.) —
// only keep the first to avoid spamming the Links tab.
const FIRST_ONLY_RELS = new Set([
  "canonical",
  "alternate",
  "icon",
  "shortcut icon",
  "apple-touch-icon",
  "apple-touch-icon-precomposed",
  "manifest",
  "mask-icon",
  "stylesheet",
  "preload",
  "prefetch",
  "dns-prefetch",
  "preconnect",
]);

// Cheap @type extraction — avoids JSON.parse during scrape; the JSON-LD tab
// renders the raw string, so a full parse is unnecessary here.
const JSONLD_TYPE_RX = /"@type"\s*:\s*"([^"]+)"/;

export function extractAllMetadata() {
  const ogFields: MetaField[] = [];
  const twitterFields: MetaField[] = [];
  const standardFields: MetaField[] = [];
  const linkFields: MetaField[] = [];
  const jsonldFields: MetaField[] = [];

  const seenRels = new Set<string>();
  let jsonldIdx = 0;

  // Single pass over every relevant head node.
  const nodes = document.querySelectorAll(
    'meta[property], meta[name], link[rel], script[type="application/ld+json"]',
  );

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const tag = node.tagName;

    if (tag === "META") {
      const meta = node as HTMLMetaElement;
      const content = meta.content?.trim();
      if (!content) continue;

      const property = meta.getAttribute("property");
      if (property) {
        if (property.startsWith("og:")) {
          ogFields.push({ key: property, value: content });
        }
        continue;
      }

      const name = meta.getAttribute("name");
      if (!name) continue;
      if (name.startsWith("twitter:")) {
        twitterFields.push({ key: name, value: content });
      } else {
        standardFields.push({ key: name, value: content });
      }
    } else if (tag === "LINK") {
      const link = node as HTMLLinkElement;
      const rel = link.getAttribute("rel");
      const href = link.href?.trim();
      if (!rel || !href) continue;
      if (FIRST_ONLY_RELS.has(rel)) {
        if (seenRels.has(rel)) continue;
        seenRels.add(rel);
      }
      linkFields.push({ key: rel, value: href });
    } else if (tag === "SCRIPT") {
      const content = (node as HTMLScriptElement).textContent?.trim();
      if (!content) continue;
      jsonldIdx++;
      const match = content.match(JSONLD_TYPE_RX);
      jsonldFields.push({
        key: match ? match[1] : `JSON-LD ${jsonldIdx}`,
        value: content,
      });
    }
  }

  // Page basics — cheap, not part of the head walk.
  const pageFields: MetaField[] = [
    { key: "title", value: document.title || "" },
    { key: "url", value: window.location.href },
    { key: "lang", value: document.documentElement.lang || "" },
  ];
  const charset =
    document.characterSet ||
    (document as unknown as { charset?: string }).charset ||
    "";
  if (charset) pageFields.push({ key: "charset", value: charset });
  const baseEl = document.querySelector("base") as HTMLBaseElement | null;
  if (baseEl?.href) pageFields.push({ key: "base", value: baseEl.href });

  return {
    og: { name: "Open Graph", fields: ogFields, hasData: ogFields.length > 0 },
    twitter: {
      name: "Twitter",
      fields: twitterFields,
      hasData: twitterFields.length > 0,
    },
    general: {
      name: "General",
      fields: standardFields,
      hasData: standardFields.length > 0,
    },
    links: {
      name: "Links",
      fields: linkFields,
      hasData: linkFields.length > 0,
    },
    jsonld: {
      name: "JSON-LD",
      fields: jsonldFields,
      hasData: jsonldFields.length > 0,
    },
    page: { name: "Page", fields: pageFields, hasData: pageFields.length > 0 },
  };
}

export type MetaData = ReturnType<typeof extractAllMetadata>;
