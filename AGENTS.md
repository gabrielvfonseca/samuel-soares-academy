# Repository Guidelines

## Project Structure & Module Organization
```
├─ src/                   # Application source
│   ├─ app/               # Next.js pages & API routes
│   ├─ components/       # Re‑usable UI components
│   ├─ lib/               # Helper libraries (API client, utils, etc.)
│   ├─ models/           # TypeScript data models
│   ├─ styles/            # Global CSS / Tailwind config
│   └─ ...
├─ public/                # Static assets (images, favicons)
├─ tests/ (optional)      # Future unit/e2e tests
├─ biome.jsonc            # Lint/format configuration
└─ package.json           # Scripts, dependencies
```
All source lives under **src**; keep new modules inside the most appropriate sub‑folder.

## Build, Test, and Development Commands
| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js dev server (hot‑reload). |
| `npm run build` | Produces an optimized production build. |
| `npm run start` | Runs the compiled app with `next start`. |
| `npm run lint` | Runs **Biome** linting across the repo. |
| `npm run format` | Auto‑formats files using Biome. |
| `npm run check` | Runs Biome’s full type‑check + lint cycle. |
| `npm test` *(not defined yet)* | Placeholder for future Jest or Playwright tests. |

## Coding Style & Naming Conventions
* Indentation: **2 spaces** (enforced by Biome). 
* Files: use **kebab‑case** for filenames, **PascalCase** for React components, and **camelCase** for functions/variables. 
* Types: Exported TypeScript types/interfaces use **PascalCase** (e.g., `UserProfile`). 
* Linting: `npm run lint` must pass before commits; run `npm run format` to auto‑fix style issues.

## Testing Guidelines
The project currently does not contain a test suite. When adding tests, follow these conventions:
* Use **Jest** for unit tests and **Playwright** for end‑to‑end tests under the `tests/` folder.
* Name test files `{module}.test.ts` or `{module}.spec.ts`.
* Run the suite with `npm test` (add a script when tests are introduced).

## Commit & Pull Request Guidelines
* **Commit messages** should follow the conventional format:
  `type(scope): short summary`
  where `type` is one of `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, or `perf`.
* PR titles mirror the commit type, and the description must:
  - Reference the related issue (`#123`).
  - Summarize changes and any migration steps.
  - Include screenshots for UI changes.
* Ensure the CI passes (`npm run lint` & `npm run check`).

## Security & Configuration Tips
* Environment variables are defined in `src/env.ts` and loaded via **@t3-oss/env-nextjs**. Do **not** commit `.env*` files.
* Secrets (e.g., API keys) must be stored in Vercel/Netlify env panels, not in source control.
* Run `npm audit` periodically and address high‑severity findings.

---
These guidelines aim to keep the codebase consistent, easy to navigate, and safe for contributors.
