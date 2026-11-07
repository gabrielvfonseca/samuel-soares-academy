import { reactConfig } from "@repo/lint-config/eslint-react";

export default [
  ...reactConfig,
  { ignores: [".next", "next-env.d.ts"] },
  {
    // Next.js pages/layouts legitimately export `metadata`, `viewport`, etc. next to components.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
];
