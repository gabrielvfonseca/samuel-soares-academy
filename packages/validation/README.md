# @repo/validation

Shared [Zod](https://zod.dev/) schemas. Both apps import from here so the
runtime shape of shared payloads (contact form, locale, ...) stays in one
place.

## Layout

```
src/
  locale.ts    localeSchema (pt | en)
  contact.ts   contact form props, fallbacks, submit result schemas
```

## Imports

```ts
import { localeSchema, type Locale } from "@repo/validation/locale";
import {
  contactFormPropsSchema,
  contactSubmitResultSchema,
  type ContactFormProps,
  type ContactSubmitResult,
} from "@repo/validation/contact";
```

## Conventions

- One schema per file, kebab-case filename.
- Export the schema (lowercase `...Schema`) and its inferred type
  (`type ... = z.infer<typeof ...Schema>`).
- Keep schemas **pure** — no side effects, no I/O, no imports from apps.
- New shared schemas go in their own file under `src/` and are added to the
  `exports` map in `package.json`.
