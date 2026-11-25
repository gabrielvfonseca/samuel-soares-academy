# @ssa/typescript-config

Shared TypeScript config. Each workspace extends one of the base configs
here via `"extends": "@ssa/typescript-config/<name>.json"`.

## Configs

| File               | Use for                                            |
| ------------------ | -------------------------------------------------- |
| `base.json`        | Shared defaults (ES2022, strict, noEmit, Bundler)  |
| `nextjs.json`      | Next.js / vinext apps (extends base + JSX, paths)  |
| `node-library.json`| Node-side packages (database, ...)                 |
| `react-library.json` | React library packages (ui, email, validation)   |

## Conventions

- Change the base config only when the change applies to **every** workspace.
- For app- or package-specific tweaks, override in the workspace's own
  `tsconfig.json` rather than editing the shared file.
- The shared configs are `noEmit: true` — each app/package runs its own
  build (Turborepo) for output.
