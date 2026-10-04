import React from "react";

interface JsonLdProps {
  schema: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Renders Schema.org JSON-LD structured data script for Search Engines,
 * Answer Engines (AEO), and Generative AI Search Models (GEO).
 */
export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default JsonLd;
