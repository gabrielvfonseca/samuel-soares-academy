import type { Thing, WithContext } from "schema-dts";

const LT_REGEX = /</gu;
const GT_REGEX = />/gu;
const AMP_REGEX = /&/gu;
const LS_REGEX = /\u2028/gu;
const PS_REGEX = /\u2029/gu;

const LT_ESCAPE = "\\u003c";
const GT_ESCAPE = "\\u003e";
const AMP_ESCAPE = "\\u0026";
const LS_ESCAPE = "\\u2028";
const PS_ESCAPE = "\\u2029";

interface JsonLdProps {
  readonly code: WithContext<Thing>;
}

const escapeJsonForHtml = (json: string): string =>
  json
    .replace(LT_REGEX, LT_ESCAPE)
    .replace(GT_REGEX, GT_ESCAPE)
    .replace(AMP_REGEX, AMP_ESCAPE)
    .replace(LS_REGEX, LS_ESCAPE)
    .replace(PS_REGEX, PS_ESCAPE);

export function JsonLd({ code }: JsonLdProps) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD script with escaped content
      dangerouslySetInnerHTML={{
        __html: escapeJsonForHtml(JSON.stringify(code)),
      }}
      type="application/ld+json"
    />
  );
}

export * from "schema-dts";
