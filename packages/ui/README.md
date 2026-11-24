# @repo/ui

Shared UI primitives for both apps. Third-party UI libraries (lucide-react,
sonner, react-hook-form, next-themes, radix-ui, tailwind-merge,
class-variance-authority, clsx) are dependencies of **this** package only —
apps import them through the `@repo/ui` re-exports and must not add them
directly.

## Layout

```
src/
  components/   shadcn/ui components (button, card, dialog, table, sidebar, ...)
  hooks/        use-mobile, use-toast
  lib/          cn(), next-themes, react-hook-form helpers, zod resolvers
  icons.ts      re-export of lucide-react icons
components.json  shadcn CLI config
```

## Imports

```ts
import { buttonVariants } from "@repo/ui/components/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { cn } from "@repo/ui/lib/utils";
import { X } from "@repo/ui/icons";
```

Each subpath maps 1:1 to a file — there is no barrel `index.ts`.

## Adding a component

1. Use the shadcn CLI with `components.json` as the config (the CLI will
   write the file into `src/components/`).
2. If the component needs a new third-party dependency, add it to **this**
   package's `package.json` (use the `catalog:` version if it's shared).
3. Run `pnpm check` and `pnpm check-types`.

## Conventions

- One component per file, kebab-case filename (`button.tsx`,
  `sidebar-provider.tsx`).
- PascalCase component names.
- Use `cn()` from `@repo/ui/lib/utils` to merge class names.
