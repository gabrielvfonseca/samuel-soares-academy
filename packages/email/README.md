# @ssa/email

React Email templates + a thin Resend client. Both apps send transactional
mail (contact-form confirmation, admin notifications) through this package.

## Layout

```
src/
  layout.ts      shared email layout (header/footer, branding)
  mailer.ts      Resend client + send() helper (reads RESEND_API_KEY,
                 CONTACT_EMAIL_FROM, CONTACT_EMAIL_TO from env)
  templates/     one .tsx per email
    contact-confirmation.tsx
    contact-notification.tsx
```

## Imports

```ts
import { send } from "@ssa/email/mailer";
import { Layout } from "@ssa/email/layout";
import { ContactConfirmation } from "@ssa/email/templates/contact-confirmation";
```

## Commands

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Local dev server (react-email) at http://localhost:3030 |
| `pnpm check-types` | Type-check the package                                 |

## Adding a template

1. Create `src/templates/<name>.tsx` exporting a default React component.
2. Wrap it in `<Layout>` from `@ssa/email/layout` for consistent branding.
3. Use the `<send>` helper from `@ssa/email/mailer` to dispatch it.

Keep templates **server-only** — they are rendered by the app's server code
and never shipped to the browser.
