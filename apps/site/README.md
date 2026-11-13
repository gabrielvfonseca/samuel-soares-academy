# Samuel Soares Academy

A modern, responsive website for a local kids football school built with **Next.js** and **TypeScript**. The project follows the structure and conventions defined in `AGENTS.md` and is ready for development, testing, and deployment on Vercel.

## Overview

The site showcases information about the school, coaches, training programs, facilities, and more. Content is served through a combination of static pages and API routes located under `src/app`.

## Tech Stack

- **Framework:** Next.js (React) with TypeScript
- **Styling:** Tailwind CSS
- **State / Forms:** React Hook Form, Zod for validation
- **Utilities:** Radix UI, Sonner, Recharts, and other UI components in `src/components/ui`
- **Environment:** Managed by `src/env.ts` using `@t3-oss/env-nextjs`

## Getting Started

```bash
# Install dependencies
npm install

# Run locally in development mode (hot‑reload)
npm run dev

# Build for production
npm run build

# Start the production build
npm run start
```

## Project Structure

```
src/                     # Application source
├─ app/                 # Next.js pages & API routes
├─ components/          # Re‑usable UI components
├─ lib/                 # Helper libraries (API client, utils, etc.)
├─ models/               # TypeScript data models
├─ styles/               # Global CSS / Tailwind config
└─ ...
```

All code lives under `src`. New modules should be placed in the most appropriate sub‑folder.

## Scripts & Linting

The repository includes Biome for linting and formatting:

```bash
npm run lint      # Run lint checks
npm run format    # Auto‑format code
npm run check     # Full type‑check + lint cycle
```

Ensure the linting passes before committing changes.

## Deployments

The site can be deployed to Vercel. After a successful `npm run build`, push the generated output to your Vercel project.

## Contributing

Please follow the guidelines in `AGENTS.md` for naming, formatting, and commit messages. Open issues or pull requests for new features, bug fixes, or improvements.

---

_This README was updated to reflect the actual project scope and structure._
