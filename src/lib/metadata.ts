export interface MetaField {
  key: string;
  value: string;
}

export interface MetaGroup {
  name: string;
  fields: MetaField[];
  hasData: boolean;
}

function getMeta(selector: string): string {
  const el = document.querySelector(selector) as HTMLMetaElement | null;
  return el?.content?.trim() || "";
}

function getMetaProperty(property: string): string {
  return getMeta(`meta[property="${property}"]`);
}

function getMetaName(name: string): string {
  return getMeta(`meta[name="${name}"]`);
}

function getLink(rel: string): string {
  const el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  return el?.href?.trim() || "";
}

export function extractAllMetadata() {
  // Open Graph
  const ogFields: MetaField[] = [];
  const ogTags = Array.from(document.querySelectorAll('meta[property^="og:"]'));
  for (const tag of ogTags) {
    const prop = tag.getAttribute("property") || "";
    const content = (tag as HTMLMetaElement).content?.trim() || "";
    if (prop && content) {
      ogFields.push({ key: prop, value: content });
    }
  }

  // Twitter
  const twitterFields: MetaField[] = [];
  const twitterTags = Array.from(document.querySelectorAll('meta[name^="twitter:"]'));
  for (const tag of twitterTags) {
    const name = tag.getAttribute("name") || "";
    const content = (tag as HTMLMetaElement).content?.trim() || "";
    if (name && content) {
      twitterFields.push({ key: name, value: content });
    }
  }

  // Standard meta
  const standardFields: MetaField[] = [];
  const standardNames = [
    "description",
    "keywords",
    "author",
    "robots",
    "viewport",
    "theme-color",
    "generator",
    "application-name",
    "msapplication-TileColor",
    "msapplication-config",
    "format-detection",
    "referrer",
    "color-scheme",
  ];
  for (const name of standardNames) {
    const value = getMetaName(name);
    if (value) standardFields.push({ key: name, value });
  }

  // Also catch any other meta[name] tags
  const allMetaNames = Array.from(document.querySelectorAll("meta[name]"));
  for (const tag of allMetaNames) {
    const name = tag.getAttribute("name") || "";
    const content = (tag as HTMLMetaElement).content?.trim() || "";
    if (name && content && !name.startsWith("twitter:") && !standardNames.includes(name)) {
      standardFields.push({ key: name, value: content });
    }
  }

  // Link tags
  const linkFields: MetaField[] = [];
  const linkRels = [
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
  ];
  for (const rel of linkRels) {
    const value = getLink(rel);
    if (value) linkFields.push({ key: rel, value });
  }

  // Catch all other link[rel] tags
  const allLinks = Array.from(document.querySelectorAll("link[rel]"));
  for (const link of allLinks) {
    const rel = link.getAttribute("rel") || "";
    const href = (link as HTMLLinkElement).href?.trim() || "";
    if (rel && href && !linkRels.includes(rel)) {
      linkFields.push({ key: rel, value: href });
    }
  }

  // JSON-LD
  const jsonldFields: MetaField[] = [];
  const jsonldScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  for (let i = 0; i < jsonldScripts.length; i++) {
    const script = jsonldScripts[i];
    const content = script.textContent?.trim() || "";
    if (content) {
      try {
        const parsed = JSON.parse(content);
        jsonldFields.push({
          key: parsed["@type"] || `JSON-LD ${i + 1}`,
          value: content,
        });
      } catch {
        jsonldFields.push({
          key: `JSON-LD ${i + 1}`,
          value: content,
        });
      }
    }
  }

  // Page basics
  const pageFields: MetaField[] = [];
  pageFields.push({ key: "title", value: document.title || "" });
  pageFields.push({ key: "url", value: window.location.href });
  pageFields.push({ key: "lang", value: document.documentElement.lang || "" });

  const charset = document.characterSet || document.charset || "";
  if (charset) pageFields.push({ key: "charset", value: charset });

  const baseEl = document.querySelector("base") as HTMLBaseElement | null;
  if (baseEl?.href) pageFields.push({ key: "base", value: baseEl.href });

  return {
    og: { name: "Open Graph", fields: ogFields, hasData: ogFields.length > 0 },
    twitter: { name: "Twitter", fields: twitterFields, hasData: twitterFields.length > 0 },
    general: { name: "General", fields: standardFields, hasData: standardFields.length > 0 },
    links: { name: "Links", fields: linkFields, hasData: linkFields.length > 0 },
    jsonld: { name: "JSON-LD", fields: jsonldFields, hasData: jsonldFields.length > 0 },
    page: { name: "Page", fields: pageFields, hasData: pageFields.length > 0 },
  };
}

export type MetaData = ReturnType<typeof extractAllMetadata>;
