import type { CSSProperties } from "react";
import type { MetaField, MetaGroup } from "@/lib/metadata";
import type { ValidationResult } from "@/lib/validate";
import { fontMono, theme } from "@/styles/theme";
import { Field, fieldStyles } from "./Field";
import { ValidationBanner } from "./ValidationBanner";

const styles: Record<string, CSSProperties> = {
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.imageBg,
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    display: "block",
  },
  row: {
    display: "flex",
    gap: 32,
    marginBottom: 14,
  },
  codeBlock: {
    backgroundColor: theme.codeBg,
    border: `1px solid ${theme.border}`,
    borderRadius: 6,
    padding: 10,
    fontSize: 11,
    fontFamily: fontMono,
    color: theme.textMuted,
    overflow: "auto",
    maxHeight: 200,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  noData: {
    padding: "20px 0",
    textAlign: "center",
    color: theme.textDim,
    fontSize: 13,
  },
};

const HANDLED_KEYS = new Set([
  "og:title",
  "twitter:title",
  "title",
  "og:description",
  "twitter:description",
  "description",
  "og:image",
  "twitter:image",
  "og:image:type",
  "twitter:image:type",
  "og:image:width",
  "twitter:image:width",
  "og:image:height",
  "twitter:image:height",
  "og:site_name",
  "twitter:site",
  "og:url",
  "twitter:url",
  "url",
]);

const GROUP_TO_VALIDATION_KEY: Record<string, "og" | "twitter" | "general"> = {
  "Open Graph": "og",
  Twitter: "twitter",
  General: "general",
};

export function TabContent({
  group,
  imageUrl,
  validation,
  showValidation,
}: {
  group: MetaGroup;
  imageUrl?: string;
  validation: ValidationResult;
  showValidation: boolean;
}) {
  if (!group.hasData) {
    return <div style={styles.noData}>No {group.name} metadata found</div>;
  }

  if (group.name === "JSON-LD") {
    return (
      <div>
        {group.fields.map((field, i) => (
          <div key={i} style={fieldStyles.field}>
            <div style={{ ...fieldStyles.label, marginBottom: 4 }}>
              {field.key}
            </div>
            <pre style={styles.codeBlock}>{field.value}</pre>
          </div>
        ))}
      </div>
    );
  }

  const validationGroup = GROUP_TO_VALIDATION_KEY[group.name];
  const groupIssues =
    showValidation && validationGroup
      ? validation.issues.filter((i) => i.group === validationGroup)
      : [];
  const severityFor = (key: string) =>
    showValidation && validationGroup
      ? validation.byField.get(`${validationGroup}:${key}`)
      : undefined;

  const fieldMap = new Map(group.fields.map((f) => [f.key, f.value]));
  const isOg = group.name === "Open Graph";
  const isTwitter = group.name === "Twitter";

  const title =
    fieldMap.get("og:title") ||
    fieldMap.get("twitter:title") ||
    fieldMap.get("title") ||
    "";
  const description =
    fieldMap.get("og:description") ||
    fieldMap.get("twitter:description") ||
    fieldMap.get("description") ||
    "";
  const image =
    fieldMap.get("og:image") || fieldMap.get("twitter:image") || imageUrl || "";
  const imageType = fieldMap.get("og:image:type") || "";
  const imageWidth =
    fieldMap.get("og:image:width") || fieldMap.get("twitter:image:width") || "";
  const imageHeight =
    fieldMap.get("og:image:height") ||
    fieldMap.get("twitter:image:height") ||
    "";

  const showImagePreview = (isOg || isTwitter) && image;
  const titleLabel = isOg ? "og:title" : isTwitter ? "twitter:title" : "title";
  const descLabel = isOg
    ? "og:description"
    : isTwitter
      ? "twitter:description"
      : "description";
  const imageLabel = isOg ? "og:image" : "twitter:image";

  return (
    <div>
      <ValidationBanner issues={groupIssues} />

      {title && (
        <Field
          label={titleLabel}
          value={title}
          severity={severityFor(titleLabel)}
        />
      )}
      {description && (
        <Field
          label={descLabel}
          value={description}
          severity={severityFor(descLabel)}
        />
      )}
      {imageType && <Field label="og:image:type" value={imageType} />}

      {(imageWidth || imageHeight) && (
        <div style={styles.row}>
          {imageWidth && (
            <div>
              <div style={{ ...fieldStyles.label, marginBottom: 4 }}>
                {isOg ? "og:image:width" : "image:width"}
              </div>
              <div style={{ ...fieldStyles.value, cursor: "default" }}>
                {imageWidth}
              </div>
            </div>
          )}
          {imageHeight && (
            <div>
              <div style={{ ...fieldStyles.label, marginBottom: 4 }}>
                {isOg ? "og:image:height" : "image:height"}
              </div>
              <div style={fieldStyles.value}>{imageHeight}</div>
            </div>
          )}
        </div>
      )}

      {showImagePreview && (
        <div style={fieldStyles.field}>
          <div style={{ ...fieldStyles.label, marginBottom: 4 }}>
            {imageLabel}
          </div>
          <div style={styles.imageContainer}>
            <img
              src={image}
              alt="Preview"
              style={styles.image}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {group.fields
        .filter((f: MetaField) => !HANDLED_KEYS.has(f.key))
        .map((field, i) => (
          <Field
            key={i}
            label={field.key}
            value={field.value}
            severity={severityFor(field.key)}
          />
        ))}
    </div>
  );
}
